<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE reclamations
            MODIFY COLUMN statut ENUM(
                'NOUVEAU',
                'QUALIFIE',
                'ASSIGNE',
                'EN_COURS',
                'RESOLU',
                'A_VALIDER',
                'CLOTURE',
                'REJETE',
                'DOUBLON'
            ) NOT NULL DEFAULT 'NOUVEAU'
        ");
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            return;
        }

        DB::statement("
            ALTER TABLE reclamations
            MODIFY COLUMN statut ENUM(
                'NOUVEAU',
                'QUALIFIE',
                'ASSIGNE',
                'EN_COURS',
                'RESOLU',
                'CLOTURE',
                'REJETE',
                'DOUBLON'
            ) NOT NULL DEFAULT 'NOUVEAU'
        ");
    }
};
