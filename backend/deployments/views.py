from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Deployment, DeploymentStatus
from .serializers import DeploymentSerializer, DeploymentStatusSerializer
from .tasks import process_deployment

# Create your views here.

class DeploymentViewSet(viewsets.ModelViewSet):
    queryset = Deployment.objects.all()
    serializer_class = DeploymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['package__name', 'description', 'created_by__username']
    ordering_fields = ['created_at', 'scheduled_for']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        deployment = serializer.instance
        if not deployment.scheduled_for or deployment.scheduled_for <= timezone.now():
            process_deployment.delay(deployment.id)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        deployment = self.get_object()
        for status in deployment.deployment_statuses.filter(status__in=['pending', 'in_progress']):
            status.status = 'cancelled'
            status.save()
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def retry_failed(self, request, pk=None):
        deployment = self.get_object()
        for status in deployment.deployment_statuses.filter(status='failed'):
            status.status = 'pending'
            status.save()
        return Response({'status': 'success'})

class DeploymentStatusViewSet(viewsets.ModelViewSet):
    queryset = DeploymentStatus.objects.all()
    serializer_class = DeploymentStatusSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['status', 'client__hostname', 'deployment__package__name']
    ordering_fields = ['started_at', 'completed_at']
    ordering = ['-started_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        deployment_id = self.request.query_params.get('deployment', None)
        if deployment_id:
            queryset = queryset.filter(deployment_id=deployment_id)
        return queryset
