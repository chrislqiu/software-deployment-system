from rest_framework import serializers
from .models import Deployment, DeploymentStatus
from packages.models import Package
from clients.models import Client

class DeploymentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeploymentStatus
        fields = ['id', 'client', 'status', 'started_at', 'completed_at',
                 'error_message', 'log_output']
        read_only_fields = ['id', 'started_at', 'completed_at']

class DeploymentSerializer(serializers.ModelSerializer):
    deployment_statuses = DeploymentStatusSerializer(many=True, read_only=True)
    package = serializers.PrimaryKeyRelatedField(queryset=Package.objects.all())
    clients = serializers.PrimaryKeyRelatedField(many=True, queryset=Client.objects.all())

    class Meta:
        model = Deployment
        fields = ['id', 'package', 'clients', 'description', 'created_at',
                 'scheduled_for', 'deployment_statuses']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        clients = validated_data.pop('clients')
        deployment = super().create(validated_data)
        for client in clients:
            DeploymentStatus.objects.create(deployment=deployment, client=client)
        return deployment 