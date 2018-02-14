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
    'Modelica.Mechanics.Rotational.Components.ElastoBacklash',
    'Modelica.Mechanics.Rotational.Components.ElastoBacklash2',
    'Modelica.Mechanics.Rotational.Components.BearingFriction',
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


FLUID_HEAT_FLOW = [
    'Modelica.Thermal.FluidHeatFlow.Components.IsolatedPipe',
    'Modelica.Thermal.FluidHeatFlow.Components.HeatedPipe',
    'Modelica.Thermal.FluidHeatFlow.Components.Valve',

    'Modelica.Thermal.FluidHeatFlow.Sensors.PressureSensor',
    'Modelica.Thermal.FluidHeatFlow.Sensors.TemperatureSensor',
    'Modelica.Thermal.FluidHeatFlow.Sensors.RelPressureSensor',
    'Modelica.Thermal.FluidHeatFlow.Sensors.RelTemperatureSensor',
    'Modelica.Thermal.FluidHeatFlow.Sensors.MassFlowSensor',
    'Modelica.Thermal.FluidHeatFlow.Sensors.VolumeFlowSensor',
    'Modelica.Thermal.FluidHeatFlow.Sensors.EnthalpyFlowSensor',

    'Modelica.Thermal.FluidHeatFlow.Sources.Ambient',
    'Modelica.Thermal.FluidHeatFlow.Sources.AbsolutePressure',
    'Modelica.Thermal.FluidHeatFlow.Sources.VolumeFlow',
    'Modelica.Thermal.FluidHeatFlow.Sources.PressureIncrease',
    'Modelica.Thermal.FluidHeatFlow.Sources.IdealPump'
]

HEAT_TRANSFER = [
    'Modelica.Thermal.HeatTransfer.Components.HeatCapacitor',
    'Modelica.Thermal.HeatTransfer.Components.ThermalConductor',
    'Modelica.Thermal.HeatTransfer.Components.ThermalResistor',
    'Modelica.Thermal.HeatTransfer.Components.Convection',
    'Modelica.Thermal.HeatTransfer.Components.ConvectiveResistor',
    'Modelica.Thermal.HeatTransfer.Components.BodyRadiation',
    'Modelica.Thermal.HeatTransfer.Components.ThermalCollector',

    'Modelica.Thermal.HeatTransfer.Sensors.TemperatureSensor',
    'Modelica.Thermal.HeatTransfer.Sensors.RelTemperatureSensor',
    'Modelica.Thermal.HeatTransfer.Sensors.HeatFlowSensor',
    'Modelica.Thermal.HeatTransfer.Sensors.ConditionalFixedHeatFlowSensor',

    'Modelica.Thermal.HeatTransfer.Sources.FixedTemperature',
    'Modelica.Thermal.HeatTransfer.Sources.PrescribedTemperature',
    'Modelica.Thermal.HeatTransfer.Sources.FixedHeatFlow',
    'Modelica.Thermal.HeatTransfer.Sources.PrescribedHeatFlow',

    'Modelica.Thermal.HeatTransfer.Celsius.ToKelvin',
    'Modelica.Thermal.HeatTransfer.Celsius.FromKelvin',
    'Modelica.Thermal.HeatTransfer.Celsius.FixedTemperature',
    'Modelica.Thermal.HeatTransfer.Celsius.PrescribedTemperature',
    'Modelica.Thermal.HeatTransfer.Celsius.TemperatureSensor',

    'Modelica.Thermal.HeatTransfer.Fahrenheit.ToKelvin',
    'Modelica.Thermal.HeatTransfer.Fahrenheit.FromKelvin',
    'Modelica.Thermal.HeatTransfer.Fahrenheit.FixedTemperature',
    'Modelica.Thermal.HeatTransfer.Fahrenheit.PrescribedTemperature',
    'Modelica.Thermal.HeatTransfer.Fahrenheit.TemperatureSensor',

    'Modelica.Thermal.HeatTransfer.Rankine.ToKelvin',
    'Modelica.Thermal.HeatTransfer.Rankine.FromKelvin',
    'Modelica.Thermal.HeatTransfer.Rankine.FixedTemperature',
    'Modelica.Thermal.HeatTransfer.Rankine.PrescribedTemperature',
    'Modelica.Thermal.HeatTransfer.Rankine.TemperatureSensor'
]

COMPLEX_BLOCKS = [
    'Modelica.ComplexBlocks.ComplexMath.Conj',
    'Modelica.ComplexBlocks.ComplexMath.Gain',
    'Modelica.ComplexBlocks.ComplexMath.Sum',
    'Modelica.ComplexBlocks.ComplexMath.Feedback',
    'Modelica.ComplexBlocks.ComplexMath.Add',
    'Modelica.ComplexBlocks.ComplexMath.Add3',
    'Modelica.ComplexBlocks.ComplexMath.Product',
    'Modelica.ComplexBlocks.ComplexMath.Division',
    'Modelica.ComplexBlocks.ComplexMath.Sqrt',
    'Modelica.ComplexBlocks.ComplexMath.Sin',
    'Modelica.ComplexBlocks.ComplexMath.Cos',
    'Modelica.ComplexBlocks.ComplexMath.Tan',
    'Modelica.ComplexBlocks.ComplexMath.Asin',
    'Modelica.ComplexBlocks.ComplexMath.Acos',
    'Modelica.ComplexBlocks.ComplexMath.Atan',
    'Modelica.ComplexBlocks.ComplexMath.Sinh',
    'Modelica.ComplexBlocks.ComplexMath.Cosh',
    'Modelica.ComplexBlocks.ComplexMath.Tanh',
    'Modelica.ComplexBlocks.ComplexMath.Exp',
    'Modelica.ComplexBlocks.ComplexMath.Log',
    'Modelica.ComplexBlocks.ComplexMath.RealToComplex',
    'Modelica.ComplexBlocks.ComplexMath.PolarToComplex',
    'Modelica.ComplexBlocks.ComplexMath.ComplexToReal',
    'Modelica.ComplexBlocks.ComplexMath.ComplexToPolar',
    'Modelica.ComplexBlocks.ComplexMath.TransferFunction',

    'Modelica.ComplexBlocks.Sources.ComplexExpression',
    'Modelica.ComplexBlocks.Sources.ComplexConstant',
    'Modelica.ComplexBlocks.Sources.ComplexStep',
    'Modelica.ComplexBlocks.Sources.ComplexRotatingPhasor',
    'Modelica.ComplexBlocks.Sources.LogFrequencySweep'
]

BLOCKS_CONTINUOUS = [
    'Modelica.Thermal.FluidHeatFlow.Sources.IdealPump',
    'Modelica.Blocks.Continuous.LimIntegrator',
    'Modelica.Blocks.Continuous.Derivative',
    'Modelica.Blocks.Continuous.FirstOrder',
    'Modelica.Blocks.Continuous.SecondOrder',
    'Modelica.Blocks.Continuous.PI',
    'Modelica.Blocks.Continuous.PID',
    'Modelica.Blocks.Continuous.LimPID',
    'Modelica.Blocks.Continuous.TransferFunction',
    'Modelica.Blocks.Continuous.StateSpace',
    'Modelica.Blocks.Continuous.Der',
    'Modelica.Blocks.Continuous.LowpassButterworth',
    'Modelica.Blocks.Continuous.CriticalDamping',
    'Modelica.Blocks.Continuous.Filter',

    'Modelica.Blocks.Discrete.Sampler',
    'Modelica.Blocks.Discrete.ZeroOrderHold',
    'Modelica.Blocks.Discrete.FirstOrderHold',
    'Modelica.Blocks.Discrete.UnitDelay',
    'Modelica.Blocks.Discrete.TransferFunction',
    'Modelica.Blocks.Discrete.StateSpace',
    'Modelica.Blocks.Discrete.TriggeredSampler',
    'Modelica.Blocks.Discrete.TriggeredMax',


    'Modelica.Blocks.Math.InverseBlockConstraints',
    'Modelica.Blocks.Math.Gain',
    'Modelica.Blocks.Math.MatrixGain',
    'Modelica.Blocks.Math.MultiSum',
    'Modelica.Blocks.Math.MultiProduct',
    'Modelica.Blocks.Math.MultiSwitch',
    'Modelica.Blocks.Math.Sum',
    'Modelica.Blocks.Math.Feedback',
    'Modelica.Blocks.Math.Add',
    'Modelica.Blocks.Math.Add3',
    'Modelica.Blocks.Math.Product',
    'Modelica.Blocks.Math.Division',
    'Modelica.Blocks.Math.Abs',
    'Modelica.Blocks.Math.Sign',
    'Modelica.Blocks.Math.Sqrt',
    'Modelica.Blocks.Math.Sin',
    'Modelica.Blocks.Math.Cos',
    'Modelica.Blocks.Math.Tan',
    'Modelica.Blocks.Math.Asin',
    'Modelica.Blocks.Math.Acos',
    'Modelica.Blocks.Math.Atan',
    'Modelica.Blocks.Math.Atan2',
    'Modelica.Blocks.Math.Sinh',
    'Modelica.Blocks.Math.Cosh',
    'Modelica.Blocks.Math.Tanh',
    'Modelica.Blocks.Math.Exp',
    'Modelica.Blocks.Math.Log',
    'Modelica.Blocks.Math.Log10',
    'Modelica.Blocks.Math.RealToInteger',
    'Modelica.Blocks.Math.IntegerToReal'

    'Modelica.Blocks.Sources.RealExpression',
    'Modelica.Blocks.Sources.IntegerExpression',
    'Modelica.Blocks.Sources.BooleanExpression',
    'Modelica.Blocks.Sources.Clock',
    'Modelica.Blocks.Sources.Constant',
    'Modelica.Blocks.Sources.Step',
    'Modelica.Blocks.Sources.Ramp',
    'Modelica.Blocks.Sources.Sine',
    'Modelica.Blocks.Sources.Cosine',
    'Modelica.Blocks.Sources.ExpSine',
    'Modelica.Blocks.Sources.Exponentials',
    'Modelica.Blocks.Sources.Pulse',
    'Modelica.Blocks.Sources.SawTooth',
    'Modelica.Blocks.Sources.Trapezoid',

    'Modelica.Blocks.Sources.BooleanConstant',
    'Modelica.Blocks.Sources.BooleanStep',
    'Modelica.Blocks.Sources.BooleanPulse',
    'Modelica.Blocks.Sources.SampleTrigger',
    'Modelica.Blocks.Sources.BooleanTable',

    'Modelica.Blocks.Sources.IntegerConstant',
    'Modelica.Blocks.Sources.IntegerStep',
    'Modelica.Blocks.Sources.IntegerTable'
]

DOMAINS = [
    "Modelica.Electrical.Analog",
    "Modelica.Mechanics.Translational",
    "Modelica.Mechanics.Rotational",
    "Modelica.Thermal.FluidHeatFlow",
    "Modelica.Thermal.HeatTransfer",
    "Modelica.Blocks"
]

COMPONENTS = ELECTRICAL_ANALOG + TRANSLATIONAL_MECHANICS + ROTATIONAL_MECHANICS + FLUID_HEAT_FLOW + HEAT_TRANSFER + BLOCKS_CONTINUOUS

#COMPONENTS = ['Modelica.Mechanics.Rotational.Components.Gearbox']
result = []
COMPONENTS = DOMAINS
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
