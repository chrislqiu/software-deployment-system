from rest_framework import serializers
from .models import Client

class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'hostname', 'ip_address', 'os_type', 'os_version', 
                 'status', 'last_seen', 'registration_date']
        read_only_fields = ['id', 'registration_date'] 