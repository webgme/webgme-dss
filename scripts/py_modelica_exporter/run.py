import logging
import json
from exporters import ComponentExporter

logger = logging.getLogger('py_modelica_exporter')
logger.setLevel(logging.ERROR)

# create console handler with a higher log level
ch = logging.StreamHandler()
ch.setLevel(logging.ERROR)
logger.addHandler(ch)

# # create formatter and add it to the handlers
# formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# fh.setFormatter(formatter)
# ch.setFormatter(formatter)

# add the handlers to the logger
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
    'Modelica.Mechanics.Translational.Components.Fixed',
    'Modelica.Mechanics.Translational.Components.Mass',
    'Modelica.Mechanics.Translational.Components.Rod',
    'Modelica.Mechanics.Translational.Components.Spring',
    'Modelica.Mechanics.Translational.Components.Damper',
    'Modelica.Mechanics.Translational.Components.SpringDamper',
    'Modelica.Mechanics.Translational.Components.ElastoGap',
    'Modelica.Mechanics.Translational.Components.SupportFriction',
    'Modelica.Mechanics.Translational.Components.Brake',
    'Modelica.Mechanics.Translational.Components.IdealGearR2T',
    'Modelica.Mechanics.Translational.Components.IdealRollingWheel',
    'Modelica.Mechanics.Translational.Components.InitializeFlange',
    'Modelica.Mechanics.Translational.Components.MassWithStopAndFriction',
    'Modelica.Mechanics.Translational.Components.RelativeStates',


    'Modelica.Mechanics.Translational.Sensors.PositionSensor',
    'Modelica.Mechanics.Translational.Sensors.SpeedSensor',
    'Modelica.Mechanics.Translational.Sensors.AccSensor',
    'Modelica.Mechanics.Translational.Sensors.RelPositionSensor',
    'Modelica.Mechanics.Translational.Sensors.RelSpeedSensor',
    'Modelica.Mechanics.Translational.Sensors.RelAccSensor',
    'Modelica.Mechanics.Translational.Sensors.ForceSensor',
    'Modelica.Mechanics.Translational.Sensors.PowerSensor',
    'Modelica.Mechanics.Translational.Sensors.MultiSensor',

    'Modelica.Mechanics.Translational.Sources.Position',
    'Modelica.Mechanics.Translational.Sources.Speed',
    'Modelica.Mechanics.Translational.Sources.Accelerate',
    'Modelica.Mechanics.Translational.Sources.Move',
    'Modelica.Mechanics.Translational.Sources.Force',
    'Modelica.Mechanics.Translational.Sources.Force2',
    'Modelica.Mechanics.Translational.Sources.LinearSpeedDependentForce',
    'Modelica.Mechanics.Translational.Sources.QuadraticSpeedDependentForce',
    'Modelica.Mechanics.Translational.Sources.ConstantForce',
    'Modelica.Mechanics.Translational.Sources.SignForce',
    'Modelica.Mechanics.Translational.Sources.ConstantSpeed',
    'Modelica.Mechanics.Translational.Sources.ForceStep'
]

ROTATIONAL_MECHANICS = [
    'Modelica.Mechanics.Rotational.Components.Fixed',
    'Modelica.Mechanics.Rotational.Components.Inertia',
    'Modelica.Mechanics.Rotational.Components.Disc',
    'Modelica.Mechanics.Rotational.Components.Spring',
    'Modelica.Mechanics.Rotational.Components.Damper',
    'Modelica.Mechanics.Rotational.Components.SpringDamper',
    'Modelica.Mechanics.Rotational.Components.SpringDamper',
    'Modelica.Mechanics.Rotational.Components.ElastoBacklash2',
    'Modelica.Mechanics.Rotational.Components.ElastoBacklash2',
    'Modelica.Mechanics.Rotational.Components.Brake',
    'Modelica.Mechanics.Rotational.Components.Clutch',
    'Modelica.Mechanics.Rotational.Components.OneWayClutch',
    'Modelica.Mechanics.Rotational.Components.IdealGear',
    'Modelica.Mechanics.Rotational.Components.LossyGear',
    'Modelica.Mechanics.Rotational.Components.IdealPlanetary',
    'Modelica.Mechanics.Rotational.Components.Gearbox',
    'Modelica.Mechanics.Rotational.Components.IdealGearR2T',
    'Modelica.Mechanics.Rotational.Components.IdealRollingWheel',
    'Modelica.Mechanics.Rotational.Components.InitializeFlange',
    'Modelica.Mechanics.Rotational.Components.RelativeStates',
    'Modelica.Mechanics.Rotational.Components.TorqueToAngleAdaptor',
    'Modelica.Mechanics.Rotational.Components.AngleToTorqueAdaptor',

    'Modelica.Mechanics.Rotational.Sensors.AngleSensor',
    'Modelica.Mechanics.Rotational.Sensors.SpeedSensor',
    'Modelica.Mechanics.Rotational.Sensors.AccSensor',
    'Modelica.Mechanics.Rotational.Sensors.RelAngleSensor',
    'Modelica.Mechanics.Rotational.Sensors.RelSpeedSensor',
    'Modelica.Mechanics.Rotational.Sensors.RelAccSensor',
    'Modelica.Mechanics.Rotational.Sensors.TorqueSensor',
    'Modelica.Mechanics.Rotational.Sensors.PowerSensor',
    'Modelica.Mechanics.Rotational.Sensors.MultiSensor',


    'Modelica.Mechanics.Rotational.Sources.Position',
    'Modelica.Mechanics.Rotational.Sources.Speed',
    'Modelica.Mechanics.Rotational.Sources.Accelerate',
    'Modelica.Mechanics.Rotational.Sources.Move',
    'Modelica.Mechanics.Rotational.Sources.Torque',
    'Modelica.Mechanics.Rotational.Sources.Torque2',
    'Modelica.Mechanics.Rotational.Sources.LinearSpeedDependentTorque',
    'Modelica.Mechanics.Rotational.Sources.QuadraticSpeedDependentTorque',
    'Modelica.Mechanics.Rotational.Sources.ConstantTorque',
    'Modelica.Mechanics.Rotational.Sources.SignTorque',
    'Modelica.Mechanics.Rotational.Sources.ConstantSpeed',
    'Modelica.Mechanics.Rotational.Sources.TorqueStep'
]

DOMAINS = [
    'Modelica.Electrical.Analog',
    'Modelica.Mechanics.Rotational',
    'Modelica.Mechanics.Translational',
    'Modelica.Thermal.HeatTransfer'
]

COMPONENTS = ELECTRICAL_ANALOG + ELECTRICAL_DIGITAL + TRANSLATIONAL_MECHANICS + ROTATIONAL_MECHANICS
result = []
component_exporter = ComponentExporter([], export_icons=True)

for modelica_uri in COMPONENTS:
    try:
        component = component_exporter.get_component_json(modelica_uri)

        if len(component['components']) == 1 and component['components'][0]['fullName'] == 'Exception':
            logger.error('Component failed {0}'.format(component['exportedComponentClass']))
        else:
            result.append(component)
    except Exception as err:
        logger.error('Exception at {0}'.format(modelica_uri))
        logger.exception(err)

with open('components.json', 'w') as outfile:
    json.dump(result, outfile)
