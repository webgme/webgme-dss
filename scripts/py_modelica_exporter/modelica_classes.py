__author__ = 'Zsolt'

try:
    from lxml import etree
    #print("running with lxml.etree")
except ImportError:
    try:
        # Python 2.5
        import xml.etree.cElementTree as etree
        #print("running with cElementTree on Python 2.5+")
    except ImportError:
        try:
            # Python 2.5
            import xml.etree.ElementTree as etree
            #print("running with ElementTree on Python 2.5+")
        except ImportError:
            try:
                # normal cElementTree install
                import cElementTree as etree
                #print("running with cElementTree")
            except ImportError:
                try:
                    # normal ElementTree install
                    import elementtree.ElementTree as etree
                    #print("running with ElementTree")
                except ImportError as ex:
                    print("Failed to import ElementTree from any known place")
                    raise ex


class Import(object):

    def __init__(self):
        self.full_name = None
        self.id = None
        self.kind = None

    def json(self):
        json_result = dict()
        json_result['fullName'] = self.full_name
        json_result['id'] = self.id
        json_result['kind'] = self.kind
        return json_result

    def xml(self):
        xml_result = etree.Element("Import")
        xml_result.set("FullName", self.full_name)
        xml_result.set("Id", self.id)
        xml_result.set("Kind", self.kind)

        return xml_result


class Parameter(object):

    def __init__(self):
        self.name = None
        self.full_name = None
        self.value = None
        self.description = ''
        self.modifiers = {}
        self.is_public = True
        self.dimension = 1  # '0' indicates empty string, -1 indicates table

    def json(self):
        json_result = dict()
        json_result['name'] = self.name
        json_result['fullName'] = self.full_name
        json_result['value'] = self.value
        json_result['description'] = self.description
        json_result['modifiers'] = self.modifiers
        json_result['isPublic'] = self.is_public
        json_result['dimension'] = self.dimension
        return json_result

    def xml(self):
        xml_result = etree.Element("Parameter")
        xml_result.set("Name", self.name)
        xml_result.set("FullName", self.full_name)
        xml_result.set("Value", str(self.value))
        xml_result.set("Description", self.description)
        # [xml_result.append(xml_node.xml()) for xml_node in self.modifiers]

        return xml_result


class RedeclareParameter(Parameter):

    def __init__(self):
        super(RedeclareParameter, self).__init__()
        self.redeclare_type = None
        self.modifiers = {}

    def json(self):
        json_result = dict()
        json_result['redeclare_type'] = self.redeclare_type
        json_result['modifiers'] = self.modifiers
        json_result['name'] = self.name
        json_result['value'] = self.value
        return json_result

    def xml(self):
        xml_result = etree.Element("RedeclareParameter")
        xml_result.set("RedeclareType", self.redeclare_type)

        # [xml_result.append(xml_node.xml()) for xml_node in self.modifiers]

        return xml_result


class Extend(object):

    def __init__(self):
        self.full_name = None
        self.parameters = list()  # Parameter
        self.redeclare_parameters = list()  # RedeclareParameter
        self.modifiers = {}

    def json(self):
        json_result = dict()
        json_result['fullName'] = self.full_name
        json_result['parameters'] = [json_value.json() for json_value in self.parameters]
        json_result['redeclare_parameters'] = [json_value.json() for json_value in self.redeclare_parameters]
        json_result['modifiers'] = self.modifiers
        return json_result

    def xml(self):
        xml_result = etree.Element("Extend")
        xml_result.set("FullName", self.full_name)

        [xml_result.append(xml_node.xml()) for xml_node in self.parameters]
        [xml_result.append(xml_node.xml()) for xml_node in self.redeclare_parameters]
        # [xml_result.append(xml_node.xml()) for xml_node in self.modifiers]

        return xml_result


class Connector(object):

    def __init__(self):
        self.name = None
        self.full_name = None
        self.description = ''
        self.parameters = list()  # Parameter
        self.redeclare_parameters = list()  # RedeclareParameter
        self.modifiers = {}
        self.relative_position = {
            'x': 0,
            'y': 0
        }
        self.size = {
            'width': 0,
            'height': 0
        }

    def json(self):
        json_result = dict()
        json_result['name'] = self.name
        json_result['fullName'] = self.full_name
        json_result['parameters'] = [json_value.json() for json_value in self.parameters]
        json_result['redeclare_parameters'] = [json_value.json() for json_value in self.redeclare_parameters]
        json_result['modifiers'] = self.modifiers

        return json_result

    def xml(self):
        xml_result = etree.Element("Connector")
        xml_result.set("Name", self.name)
        xml_result.set("FullName", self.full_name)

        [xml_result.append(xml_node.xml()) for xml_node in self.parameters]
        [xml_result.append(xml_node.xml()) for xml_node in self.redeclare_parameters]
        # [xml_result.append(xml_node.xml()) for xml_node in self.modifiers]

        return xml_result

    def layout_json(self):

        import hashlib
        hasher = hashlib.sha1()
        hasher.update(self.name)

        json_result = dict()
        json_result['id'] = str(int(hasher.hexdigest()[:8], 16))
        json_result['name'] = self.name
        json_result['relative_position'] = self.relative_position

        return json_result


class Package(object):

    def __init__(self):
        self.value = None
        self.name = None

    def json(self):
        json_result = dict()
        json_result['name'] = self.name
        json_result['value'] = self.value

        return json_result


class Component(object):

    def __init__(self):
        self.full_name = None
        self.comment = None
        self.parameters = list()  # Parameter
        self.redeclare_parameters = list()  # RedeclareParameter
        self.connectors = list()  # Connector
        self.extends = list()  # Extends
        self.imports = list()

        # JK - need some feedback from Z/P
        self.packages = list()

    def json(self):
        json_result = dict()
        json_result['fullName'] = self.full_name
        json_result['comment'] = self.comment
        json_result['parameters'] = [json_value.json() for json_value in self.parameters]
        json_result['redeclare_parameters'] = [json_value.json() for json_value in self.redeclare_parameters]
        json_result['connectors'] = [json_value.json() for json_value in self.connectors]
        json_result['extends'] = [json_value.json() for json_value in self.extends]
        json_result['imports'] = [json_value.json() for json_value in self.imports]
        # JK - need some feedback from Z/P
        json_result['packages'] = [json_value.json() for json_value in self.packages]
        return json_result

    def xml(self):
        xml_result = etree.Element("Component")
        xml_result.set("FullName", self.full_name)

        [xml_result.append(xml_node.xml()) for xml_node in self.parameters]
        [xml_result.append(xml_node.xml()) for xml_node in self.redeclare_parameters]
        [xml_result.append(xml_node.xml()) for xml_node in self.connectors]
        [xml_result.append(xml_node.xml()) for xml_node in self.extends]
        [xml_result.append(xml_node.xml()) for xml_node in self.imports]

        return xml_result


class ComponentAssembly(object):

    def __init__(self):
        self.name = None
        self.full_name = None
        self.comment = None
        self.connectors = list()  # Connector
        self.connections = list()
        self.component_shells = {}
        self.extent = {
            'x_min': 0,
            'x_max': 0,
            'y_min': 0,
            'y_max': 0
        }

    def json(self):
        json_result = dict()
        json_result['name'] = self.name
        json_result['fullName'] = self.full_name
        json_result['comment'] = self.comment
        json_result['connectors'] = [json_value.json() for json_value in self.connectors]
        json_result['connections'] = [json_value.json() for json_value in self.connections]
        json_result['component_shells'] = [{k: v.json()} for k, v in self.component_shells.iteritems()]

        return json_result

    def layout_json(self):
        json_result = dict()
        #json_result['extent'] = self.extent
        json_result['components'] = [c_shell.layout_json() for name, c_shell in self.component_shells.iteritems()]
        #json_result['connectors'] = [c.layout_json() for c in self.connectors]
        json_result['connections'] = [c.layout_json() for c in self.connections]

        return json_result


class ComponentShell(object):

    def __init__(self):
        self.name = None
        self.full_name = None
        # position (x,y) is the center of the component, from the center of the assembly
        self.position = {
            'x': 0,
            'y': 0
        }
        # size of the component from edge to edge; (extent is from x_pos +/-0.5*width, y_pos +/-0.5*height)
        self.size = {
            'width': 0,
            'height': 0
        }
        self.rotation = 0
        self.flip_x = False
        self.flip_y = False
        self.connectors = list()

    def json(self):
        json_result = dict()
        json_result['name'] = self.name
        json_result['connectors'] = [json_value.json() for json_value in self.connectors]

        return json_result

    def layout_json(self):

        import hashlib
        hasher = hashlib.sha1()
        hasher.update(self.name)

        json_result = dict()
        json_result['id'] = str(int(hasher.hexdigest()[:8], 16))
        json_result['name'] = self.name
        if len(self.connectors) > 0:
            json_result['ports'] = [conn.layout_json() for conn in self.connectors]
        json_result['position'] = self.position
        json_result['size'] = self.size

        return json_result


class Connection(object):

    def __init__(self):
        self.src_parent = ""
        self.src_name = ""
        self.dst_parent = ""
        self.dst_name = ""
        self.path_points = []

    def json(self):
        json_result = dict()
        json_result['src_parent'] = self.src_parent
        json_result['src_name'] = self.src_name
        json_result['dst_parent'] = self.dst_parent
        json_result['dst_name'] = self.dst_name

        return json_result

    def layout_json(self):

        import hashlib

        json_result = dict()
        json_result['name'] = self.src_parent + '_' + self.src_name + '_' + self.dst_parent + '_' + self.dst_name

        hasher = hashlib.sha1()
        hasher.update(json_result['name'])
        json_result['id'] = str(int(hasher.hexdigest()[:8], 16))

        hasher = hashlib.sha1()
        hasher.update(self.src_parent)
        src_parent_hash = str(int(hasher.hexdigest()[:8], 16))
        hasher = hashlib.sha1()
        hasher.update(self.src_name)
        src_name_hash = str(int(hasher.hexdigest()[:8], 16))
        hasher = hashlib.sha1()
        hasher.update(self.dst_parent)
        dst_parent_hash = str(int(hasher.hexdigest()[:8], 16))
        hasher = hashlib.sha1()
        hasher.update(self.dst_name)
        dst_name_hash = str(int(hasher.hexdigest()[:8], 16))

        if self.src_parent:
            json_result['srcID'] = src_parent_hash + '/' + src_name_hash
        else:
            json_result['srcID'] = src_name_hash

        if self.dst_parent:
            json_result['dstID'] = dst_parent_hash + '/' + dst_name_hash
        else:
            json_result['dstID'] = dst_name_hash

        json_result['pathPoints'] = self.path_points

        return json_result
