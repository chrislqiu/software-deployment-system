from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from .models import Client
from .serializers import ClientSerializer

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['hostname', 'ip_address', 'os_type', 'status']
    ordering_fields = ['hostname', 'last_seen', 'status']
    ordering = ['-last_seen']

    @action(detail=True, methods=['post'])
    def checkin(self, request, pk=None):
        client = self.get_object()
        client.status = 'online'
        client.last_seen = timezone.now()
        client.save()
        return Response({'status': 'success'})

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        client = self.get_object()
        status = request.data.get('status')
        if status in [s[0] for s in Client.STATUS_CHOICES]:
            client.status = status
            client.last_seen = timezone.now()
            client.save()
            return Response({'status': 'success'})
        return Response({'status': 'error', 'message': 'Invalid status'}, status=400)