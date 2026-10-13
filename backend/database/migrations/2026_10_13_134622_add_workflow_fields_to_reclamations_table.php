<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reclamations', function (Blueprint $table) {
          
            $table->foreignId('superviseur_id')
                ->nullable()
                ->after('technicien_id')
                ->constrained('users')
                ->nullOnDelete();

         
            $table->string('preuve_photo_url')->nullable()->after('photo_url');
            $table->text('preuve_commentaire')->nullable()->after('preuve_photo_url');
            $table->unsignedInteger('duree_intervention')->nullable()->after('preuve_commentaire'); // minutes

           
            $table->foreignId('valide_par')
                ->nullable()
                ->after('duree_intervention')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('valide_at')->nullable()->after('valide_par');

           
            $table->foreignId('parent_id')
                ->nullable()
                ->after('valide_at')
                ->constrained('reclamations')
                ->nullOnDelete();
            $table->boolean('is_recurrence')->default(false)->after('parent_id');

           
            $table->timestamp('date_prevue')->nullable()->after('assigned_at');

            
            $table->index('superviseur_id');
            $table->index('parent_id');
            $table->index('is_recurrence');
        });
    }

    public function down(): void
    {
        Schema::table('reclamations', function (Blueprint $table) {
            $table->dropForeign(['superviseur_id']);
            $table->dropForeign(['valide_par']);
            $table->dropForeign(['parent_id']);
            $table->dropColumn([
                'superviseur_id', 'preuve_photo_url', 'preuve_commentaire',
                'duree_intervention', 'valide_par', 'valide_at',
                'parent_id', 'is_recurrence', 'date_prevue',
            ]);
        });
    }
};