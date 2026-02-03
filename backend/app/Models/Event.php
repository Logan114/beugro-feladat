<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'date',
        'time',
    ];
     public function user()
    {
        return $this->belongsTo(User::class);
    }
}
