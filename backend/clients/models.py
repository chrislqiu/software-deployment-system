# Create your models here.
from django.db import models
from django.utils import timezone

class Client(models.Model):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('error', 'Error'),
    ]

    OS_CHOICES = [
        ('windows', 'Windows'),
        ('linux', 'Linux'),
        ('macos', 'macOS'),
    ]

    hostname = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    os_type = models.CharField(max_length=20, choices=OS_CHOICES)
    os_version = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    last_seen = models.DateTimeField(default=timezone.now)
    registration_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-last_seen']

    def __str__(self):
        return f"{self.hostname} ({self.ip_address})"

    def update_status(self, status):
        self.status = status
        self.last_seen = timezone.now()
        self.save()