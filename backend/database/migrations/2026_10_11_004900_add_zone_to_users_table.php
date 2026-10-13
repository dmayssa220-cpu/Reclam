<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('zone')->nullable()->after('email');
            $table->string('telephone')->nullable()->after('zone');
            $table->boolean('is_active')->default(true)->after('telephone');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['zone', 'telephone', 'is_active']);
        });
    }
};