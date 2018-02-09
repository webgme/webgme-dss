import logging
import json
from exporters import ComponentExporter

logger = logging.getLogger('py_modelica_exporter')
logger.setLevel(logging.DEBUG)

# create console handler with a higher log level
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
logger.addHandler(ch)

ELECTRICAL_ANALOG = [
    # Basic
    'Modelica.Electrical.Analog.Basic.Ground',
    'Modelica.Electrical.Analog.Basic.Resistor',
    'Modelica.Electrical.Analog.Basic.HeatingResistor',
    'Modelica.Electrical.Analog.Basic.Conductor',
    'Modelica.Electrical.Analog.Basic.Capacitor',
    'Modelica.Electrical.Analog.Basic.Inductor',
    'Modelica.Electrical.Analog.Basic.SaturatingInductor',
    'Modelica.Electrical.Analog.Basic.Transformer',
    #'Modelica.Electrical.Analog.Basic.M_Transformer',
    'Modelica.Electrical.Analog.Basic.Gyrator',
    'Modelica.Electrical.Analog.Basic.EMF',
    'Modelica.Electrical.Analog.Basic.TranslationalEMF',
    'Modelica.Electrical.Analog.Basic.VCV',
    'Modelica.Electrical.Analog.Basic.VCC',
    'Modelica.Electrical.Analog.Basic.CCV',
    'Modelica.Electrical.Analog.Basic.CCC',
    'Modelica.Electrical.Analog.Basic.OpAmp',
    'Modelica.Electrical.Analog.Basic.OpAmpDetailed',
    'Modelica.Electrical.Analog.Basic.VariableResistor',
    'Modelica.Electrical.Analog.Basic.VariableConductor',
    'Modelica.Electrical.Analog.Basic.VariableCapacitor',
    'Modelica.Electrical.Analog.Basic.VariableInductor',
    'Modelica.Electrical.Analog.Basic.Potentiometer',

    # IDEAL
    # TODO

    # Semiconductors
    # TODO

    # Sensors
    'Modelica.Electrical.Analog.Sensors.PotentialSensor',
    'Modelica.Electrical.Analog.Sensors.VoltageSensor',
    'Modelica.Electrical.Analog.Sensors.CurrentSensor',
    'Modelica.Electrical.Analog.Sensors.PowerSensor',

    # Sources
    'Modelica.Electrical.Analog.Sources.SignalVoltage',
    'Modelica.Electrical.Analog.Sources.ConstantVoltage',
    'Modelica.Electrical.Analog.Sources.StepVoltage',
    'Modelica.Electrical.Analog.Sources.RampVoltage',
    'Modelica.Electrical.Analog.Sources.SineVoltage',
    'Modelica.Electrical.Analog.Sources.CosineVoltage',
    'Modelica.Electrical.Analog.Sources.ExpSineVoltage',
    'Modelica.Electrical.Analog.Sources.ExponentialsVoltage',
    'Modelica.Electrical.Analog.Sources.PulseVoltage',
    'Modelica.Electrical.Analog.Sources.SawToothVoltage',
    'Modelica.Electrical.Analog.Sources.TrapezoidVoltage',
    'Modelica.Electrical.Analog.Sources.TableVoltage',
    'Modelica.Electrical.Analog.Sources.SignalCurrent',
    'Modelica.Electrical.Analog.Sources.ConstantCurrent',
    'Modelica.Electrical.Analog.Sources.StepCurrent',
    'Modelica.Electrical.Analog.Sources.RampCurrent',
    'Modelica.Electrical.Analog.Sources.SineCurrent',
    'Modelica.Electrical.Analog.Sources.CosineCurrent',
    'Modelica.Electrical.Analog.Sources.ExpSineCurrent',
    'Modelica.Electrical.Analog.Sources.ExponentialsCurrent',
    'Modelica.Electrical.Analog.Sources.PulseCurrent',
    'Modelica.Electrical.Analog.Sources.SawToothCurrent',
    'Modelica.Electrical.Analog.Sources.TrapezoidCurrent',
    'Modelica.Electrical.Analog.Sources.TableCurrent',
    'Modelica.Electrical.Analog.Sources.SupplyVoltage'
]

ELECTRICAL_DIGITAL = [
    #TODO
]

TRANSLATIONAL_MECHANICS = [
    'Modelica.Mechanics.Translational.Components.Mass',
    'Modelica.Mechanics.Translational.Components.Damper',
    'Modelica.Mechanics.Translational.Components.Spring',
    'Modelica.Mechanics.Translational.Sources.Force'
]

ROTATIONAL_MECHANICS = [
    'Modelica.Mechanics.Rotational.Components.Damper',
    'Modelica.Mechanics.Rotational.Sources.Torque',
    'Modelica.Mechanics.Rotational.Components.Inertia',
    'Modelica.Mechanics.Rotational.Components.Spring'
]

DOMAINS = [
    'Modelica.Electrical.Analog',
    'Modelica.Mechanics.Rotational',
    'Modelica.Mechanics.Translational',
    'Modelica.Thermal.HeatTransfer'
]

COMPONENTS = ELECTRICAL_ANALOG + ELECTRICAL_DIGITAL + TRANSLATIONAL_MECHANICS + ROTATIONAL_MECHANICS
#COMPONENTS = ['Modelica.Electrical.Analog.Basic.Ground']
result = []
component_exporter = ComponentExporter([], export_icons=True)

for modelica_uri in COMPONENTS:
    component = component_exporter.get_component_json(modelica_uri)
    if len(component['components']) == 1 and component['components'][0]['fullName'] == 'Exception':
        #TODO: log something here
        continue
    else:
        result.append(component)

with open('components.json', 'w') as outfile:
    json.dump(result, outfile)
