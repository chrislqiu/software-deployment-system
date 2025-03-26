# Generated by Django 4.2 on 2025-03-26 01:03

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Package",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
                ("version", models.CharField(max_length=50)),
                ("description", models.TextField(blank=True)),
                (
                    "file",
                    models.FileField(
                        upload_to="packages/",
                        validators=[
                            django.core.validators.FileExtensionValidator(
                                allowed_extensions=[
                                    "zip",
                                    "exe",
                                    "msi",
                                    "deb",
                                    "rpm",
                                    "dmg",
                                ]
                            )
                        ],
                    ),
                ),
                (
                    "os_compatibility",
                    models.CharField(
                        choices=[
                            ("windows", "Windows"),
                            ("linux", "Linux"),
                            ("macos", "macOS"),
                        ],
                        max_length=10,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "checksum",
                    models.CharField(
                        help_text="SHA-256 checksum of the package file", max_length=64
                    ),
                ),
                ("size", models.BigIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "ordering": ["-created_at"],
                "unique_together": {("name", "version")},
            },
        ),
    ]
