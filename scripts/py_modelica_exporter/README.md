Scripts for extracting graphics (svgs) and interfaces from Modelica components.
When running svgs will be generated in `./Icons/` and the interface info in `./components.json`.

To use (windows)
1. Install Python 2.7.x https://www.python.org/downloads/
2. Install Pip (if not already bundled look for pip.exe in C:\Python27\Scripts)
3. Install OpenModelica (v1.11.0)
4. Install OMPython
    - `cd %OPENMODELICAHOME%\share\omc\scripts\PythonInterface\OMPython`
    - `python -m pip install .`
5. Modify list of components in `run.py` and run it with `python run.py` in this dir as cwd.


N.B. If python is not in your path you'll need to provide the path to the python interpreter typically: `C:\Python27\python.exe`