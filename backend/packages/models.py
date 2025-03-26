from django.db import models
from django.core.validators import FileExtensionValidator
from clients.models import Client

class Package(models.Model):
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    file = models.FileField(
        upload_to='packages/',
        validators=[FileExtensionValidator(allowed_extensions=['zip', 'exe', 'msi', 'deb', 'rpm', 'dmg'])]
    )
    os_compatibility = models.CharField(max_length=10, choices=Client.OS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    checksum = models.CharField(max_length=64, help_text="SHA-256 checksum of the package file")
    size = models.BigIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('name', 'version')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.version}"

    def save(self, *args, **kwargs):
        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)
