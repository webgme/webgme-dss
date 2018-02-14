import logging
import json
from exporters import TreeExporter

logger = logging.getLogger('py_modelica_exporter')
logger.setLevel(logging.ERROR)

# create console handler with a higher log level
ch = logging.StreamHandler()
ch.setLevel(logging.ERROR)
logger.addHandler(ch)

te = TreeExporter('Modelica.Blocks.Logical')

te.export_to_json('modelica.json')
