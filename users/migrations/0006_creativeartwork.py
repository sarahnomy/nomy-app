import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [('users', '0005_alter_accountcleanuptask_kind_applesubscription'), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [migrations.CreateModel(name='CreativeArtwork', fields=[
        ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
        ('title', models.CharField(max_length=80)), ('document', models.JSONField()),
        ('created_at', models.DateTimeField(auto_now_add=True)), ('updated_at', models.DateTimeField(auto_now=True)),
        ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='creative_artworks', to=settings.AUTH_USER_MODEL)),
    ], options={'ordering': ['-updated_at']})]
