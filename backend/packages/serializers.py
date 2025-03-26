from rest_framework import serializers
from .models import Package

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'name', 'version', 'description', 'file', 'os_compatibility',
                 'size', 'created_at', 'is_active']
        read_only_fields = ['id', 'size', 'created_at'] 