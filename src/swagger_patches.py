"""
This file patches all the stupid and broken stuff in the swagger module
"""

from flask_restful_swagger_3 import Schema, REGISTRY_SCHEMA


def check_type(self, type_, key, value):
        if type_:
            if type_ == 'array':
                if not isinstance(value, list):
                    raise ValueError(f'The attribute "{key}" must be a list, but was "{type(value)}')
                temp = self.properties[key]
                if not isinstance(temp, dict):
                    return # no schema to check
                cls = temp.get('items')
                if cls and getattr(cls, '__name__') is not None and cls.__name__ in REGISTRY_SCHEMA:
                    if getattr(cls, '_abstract_class') is not None and cls._abstract_class:
                        for v in value:
                            if v.__class__.__name__ not in REGISTRY_SCHEMA:
                                raise ValueError(f'{v.__name__} is not a registered schema')
                            if not isinstance(v, cls):
                                raise ValueError(f'The schema {v.__name__} should be a subclass of {cls.__name__}')

                            # TODO , check type on subclass



                    elif cls.type == 'object':
                        for v in value:
                            cls(**v)
                    else:
                        for v in value:
                            self.check_type(cls.type,  key, v)
            if type_ == 'integer' and not isinstance(value, int):
                raise ValueError(f'The attribute "{key}" must be an int, but was "{type(value)}"')
            if type_ == 'number' and not isinstance(value, int) and not isinstance(value, float):
                raise ValueError(
                    f'The attribute "{key}" must be an int or float, but was "{type(value)}"')
            if type_ == 'string' and not isinstance(value, str):
                raise ValueError(f'The attribute "{key}" must be a string, but was "{type(value)}"')
            if type_ == 'boolean' and not isinstance(value, bool):
                raise ValueError(f'The attribute "{key}" must be a bool, but was "{type(value)}"')

# Monkey patch the broken check_type method
Schema.check_type = check_type


def summary(summary: str):
    """
    A decorator to add a summary to a method
    :param summary: The summary of the method
    :param description: The description of the method
    :return: The method with the summary and description
    """
    def wrapper(func):
        if "__summary" in func.__dict__:
            func.__summary.append(summary)
        else:
            func.__summary = [summary]

        return func
    return wrapper