import os
import pdoc


def is_python_file(filename):
    """
    Function to check if file is a Python source file and not one of the excluded files
    """
    return (filename.endswith('.py') and
            not filename.startswith('__') and
            filename not in ['app.py', 'wsgi.py', 'keygen.py'])


def is_package(directory):
    """
    function to check if a directory is a package
    """
    return '__init__.py' in os.listdir(directory)


def generate_pdoc(generate=False):
    if generate:
        root_directory = os.path.dirname(__file__)
        output_directory = os.path.join(root_directory, 'pydocs')
        os.makedirs(output_directory, exist_ok=True)

        documentation_files = []

        # Walk through the project directories
        for dirpath, dirnames, files in os.walk(root_directory, topdown=True):

            dirnames[:] = [d for d in dirnames if d != '__pycache__' and d[0] != '.' and d != 'migrations']

            # Generate documentation for each Python file
            for file in filter(is_python_file, files):
                try:
                    file_path = os.path.join(dirpath, file)
                    if is_package(dirpath):
                        # Create a module name from the directory path for packages
                        module_name = os.path.relpath(file_path, root_directory).replace(os.sep, '.')
                        module_name = module_name.rsplit('.', 1)[0]  # Remove the .py extension

                        # Generate the HTML documentation for the module
                        module_doc = pdoc.html(module_name)

                        # Define the output file path
                        relative_dirpath = os.path.relpath(dirpath, root_directory)
                        doc_dir = os.path.join(output_directory, relative_dirpath)
                        os.makedirs(doc_dir, exist_ok=True)
                        output_file = os.path.join(doc_dir, f'{file[:-3]}.html')

                        # Write the documentation to the file
                        with open(output_file, 'wb') as html_file:
                            print("generating file")
                            html_file.write(module_doc.encode('utf-8'))
                        documentation_files.append(os.path.join(relative_dirpath, f'{file[:-3]}.html'))
                except Exception as e:
                    if 'venv.Lib' in str(e):
                        continue
                    print(f'Error: {e}')
                    continue

        # Generate the main index page
        index_content = '<html><head><title>Project Documentation</title></head><body>'
        index_content += '<h1>Project Documentation Index</h1>'
        index_content += '<ul>'
        for doc_file in documentation_files:
            link = os.path.join('.', doc_file)
            index_content += f'<li><a href="{link}">{doc_file}</a></li>'
        index_content += '</ul>'
        index_content += '</body></html>'

        # Save the index page
        with open(os.path.join(output_directory, 'index.html'), 'w') as index_file:
            index_file.write(index_content)
        print(f'Documentation generated in: {output_directory}')
