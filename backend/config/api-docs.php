<?php

return [


    'title' => env('API_DOCS_TITLE', env('APP_NAME', 'Laravel') . ' API'),

    'version' => env('API_DOCS_VERSION', '1.0.0'),

    'description' => 'Auto generated reference for every endpoint exposed by this application.',

  

    'base_url' => env('API_DOCS_BASE_URL', env('APP_URL', 'http://localhost')),

   

    'routes' => [
     
        'include' => ['api/*'],

       
        'exclude' => [
            'api/documentation*',
            '_debugbar/*',
            'telescope*',
            'horizon*',
            'sanctum/*',
            'up',
        ],

      
        'middleware' => [],

       
        'skip_closures' => false,

        
        'skip_methods' => ['HEAD', 'OPTIONS'],
    ],

    

    'strict_precedence' => false,

   

    'grouping' => [
        'strategy' => 'controller',
        'default' => 'General',
        'order' => [], 
    ],

  

    'auth' => [
      
        'middleware' => ['auth', 'auth:sanctum', 'auth:api', 'auth.basic', 'jwt.auth', 'jwt.verify'],

        'header' => 'Authorization',

        'value' => 'Bearer {YOUR_API_TOKEN}',

       
        'example_token' => env('API_DOCS_EXAMPLE_TOKEN'),

        'description' => 'Bearer token issued by the authentication endpoints.',
    ],

   

    'headers' => [
        'defaults' => [
            'Accept' => 'application/json',
        ],

     
        'body' => [
            'Content-Type' => 'application/json',
        ],
    ],

  

    'responses' => [
       
        'default_status' => [
            'GET' => 200,
            'POST' => 201,
            'PUT' => 200,
            'PATCH' => 200,
            'DELETE' => 204,
        ],

     
        'include_errors' => true,

       
        'max_depth' => 4,

        
        'resource_wrapper' => 'data',
    ],

    

    'openapi' => [
       
        'source' => 'routes',

        'version' => '3.1.0',

        'servers' => [
            
        ],

       
        'use_components' => true,

        'security_schemes' => [
            'bearerAuth' => [
                'type' => 'http',
                'scheme' => 'bearer',
                'bearerFormat' => 'JWT',
                'description' => 'Bearer token issued by the authentication endpoints.',
            ],
        ],

       
        'default_security_scheme' => 'bearerAuth',

        'contact' => [
            
        ],

        'license' => [
          
        ],

        'terms_of_service' => null,

      
        'extensions' => [],
    ],

   

    'code_samples' => ['curl', 'javascript', 'php'],

    
    'ui' => [
        'theme' => 'auto',           
        'logo' => null,              
        'try_it' => true,             
        'show_controllers' => true,   
        'show_middleware' => true,
        'collapse_groups' => false,
    ],

    

    'history' => [
        'enabled' => true,

        'path' => 'resources/views/vendor/api-docs/history.json',

       
        'keep' => 50,

       
        'show_in_ui' => true,

        
        'per_endpoint' => 5,

      
        'changelog' => 5,
    ],

   

    'output' => [
        'views_path' => 'resources/views/vendor/api-docs',
        'spec_file' => 'resources/views/vendor/api-docs/openapi.json',
        'static_html' => 'public/docs/index.html',
        'overwrite_views' => false, 
    ],

   

    'serve' => [
        'enabled' => true,
        'path' => 'api/documentation',
        'name' => 'api-docs.index',
        'middleware' => ['web'],
        'domain' => null,
    ],

   

    'tenancy' => [
        'enabled' => env('API_DOCS_TENANCY', false),

       
        'resolver' => null,

       
        'central_key' => 'central',

     
        'strategy' => null,

       
        'scope_cache' => true,

       
        'follow_request_host' => true,
    ],

   

    'cache' => [
        'enabled' => env('API_DOCS_CACHE', false),

       
        'store' => env('API_DOCS_CACHE_STORE'),

        'key' => 'api-docs.documentation',

        'ttl' => 3600,
    ],
];
