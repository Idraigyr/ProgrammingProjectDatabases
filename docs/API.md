# API information

### For all api endpoints and their specific documentation, please refer to the Swagger documentation

## Swagger Documentation
Available at `<url>/api/docs` with `APP_SWAGGER_ENABLED=true` set as environment variable when using a local development server.

## General API structure (backend)
For the complete, detailed relationships between entities: please refer to the ER diagram.

Each entity has a Model, a Schema and a Resource class. The Model is lies in the `model` package, in a file with the same name as the entity.
The model is the Mapper for SQLAlchemy and has all column definitions and relationships between other SQLAlchemy models.

A Schema lies in the `resource` package, in a file with the same name as the entity. The class name is the entity name appended with `Schema`.
The Schema defines and parses the JSON representation of the entity. It should function as a JSON to Entity Mapper as well in reverse.
The Schema is mostly a documentation tool that is used by the Swagger documentation.

A Resource lies in the `resource` package, preferably in the same file as the Schema.
The resource functions as an RESTful API endpoint that accepts HTTP requests. As per RESTful spec, it has at most 4 methods for each CRUD operation on
an entity. Each function has `@swagger` decorators with information about what schema is returned / used in what use case / error message.
- `post()` - HTTP `POST` for create
- `get()` - HTTP `GET` for read
- `put()` - HTTP `PUT` for update
- `delete()` - HTTP `DELETE` for removal

A Resource parses the query methods and/or JSON body and manipulates / retrieves the SQLAlchemy Models accordingly.
It functions as both the Controller and the View for an entity.

#### A special note on registering new endpoints
Each RESTful endpoint (=Resource) should be registered with an `attach_resource()` function defined in the 
resource file. This method should be mostly copied over from other examples, and be modified accordingly. 
Finally, add this function to the `resource.__init__#attach_resources()` by importing it locally and invoking it.

The reason this is done this way is because the current flask-restful-swagger-3 package does not support multiple Flask route
blueprints. So they all have to be bundled to one. The package is the only that adds Swagger 3 support, but is unfortunately unmaintained and broken in many ways.
