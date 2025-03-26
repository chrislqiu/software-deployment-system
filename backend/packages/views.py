from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from .models import Package
from .serializers import PackageSerializer
import hashlib

# Create your views here.

class PackageViewSet(viewsets.ModelViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'version', 'os_compatibility']
    ordering_fields = ['name', 'created_at', 'version']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        if file_obj:
            # Calculate SHA-256 checksum
            sha256_hash = hashlib.sha256()
            for byte_block in iter(lambda: file_obj.read(4096), b""):
                sha256_hash.update(byte_block)
            file_obj.seek(0)  # Reset file pointer to beginning
            
            serializer.save(
                checksum=sha256_hash.hexdigest(),
                size=file_obj.size
            )
