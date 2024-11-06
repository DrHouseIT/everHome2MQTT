# YAML Configuration

The YAML configuration file defines the settings and configurations for **everHome2MQTT**. It includes various sections specifying the configurations for WebSocket, MQTT, devices, subtypes, and device exclusions. Each section contains specific parameters and options that control the functionality and behavior of the system. By adjusting these configurations, the behavior of the software can be customized.

Upon the first launch of **everHome2MQTT**, a default file is automatically generated. This file already contains preset values. After each manual adjustment by the user, the update function in the **everHome2MQTT** device must be executed. If parameters are entered that are not plausible or fall outside the allowed limits, default values are set, and the file is saved again.

## 7.1 Language Settings

**language**  
Specifies the language used to translate device types, properties, etc.  
**Default value:** `de`

## 7.2 Ports

**ports.nodeRed**  
Sets the ports for Node-Red and the **everHome2MQTT** server. If the Node-Red port has been adjusted in the add-on configuration, this port must also be adjusted in the YAML configuration.  
**Default value:** `1880`

**ports.everHome2MQTT**  
If the standard port on the **HomeAssistant** host is already in use, another port can be defined here.  
**Default value:** `3000`

## 7.3 WebSocket Settings

**websocket.scan_interval**  
Specifies the interval in seconds at which the WebSocket connection is checked.  
**Minimum value:** `1`  
**Maximum value:** `60`  
**Default value:** `10`

## 7.4 Node-RED Settings

**node_red.scan_interval**  
Determines the interval in seconds at which the connection between the everHome2MQTT Server and Node-RED is checked.  
**Minimum value:** `1`  
**Maximum value:** `60`  
**Default value:** `10`

## 7.5 MQTT Settings

**mqtt.scan_interval**  
Determines the interval in seconds at which the MQTT connection is checked.  
**Minimum value:** `1`  
**Maximum value:** `60`  
**Default value:** `10`

**mqtt.retain**  
Indicates whether MQTT messages should be retained after a restart.  
Possible values:  
- **Active:** `true`, `"true"`, `1`  
- **Inactive:** `false`, `"false"`, `0`

The **retain flag** can be configured for the following topic types:  
- **config_topic:** The MQTT topic for device configuration.  
- **state_topic:** The MQTT topic for status updates.  
- **command_topic:** The MQTT topic for publishing commands.

**mqtt.retain.topics.config**  
**Default value:** `true`

**mqtt.retain.topics.state**  
**Default value:** `true`

**mqtt.retain.topics.command**  
**Default value:** `false`

## 7.6 Device Configuration

**devices.naming**  
Defines the naming schema for devices, where `<device_name>` and `<room_name>` are replaced by the device name and room name. It is recommended to always use both the device and room name to ensure unique identification of devices. The room name can be omitted if it is already included in the device name.

**devices.set_object_id**  
Specifies whether object IDs should be set.  
Possible values:  
- **Active:** `true`, `"true"`, `1`  
- **Inactive:** `false`, `"false"`, `0`  
**Default value:** `true`

If the `object_id` option is enabled, a generated ID from **everHome2MQTT** will be used. This ID is structured as follows:  
`everhome_device_id_13_subtype`

This entity ID is an example for the device with ID 13 and the attribute "subtype". If it is a group, `device` is replaced with `group`. Uniqueness is ensured by the ID and `device` or `group`.

If the setting is disabled, an entity ID from **HomeAssistant** will be created based on the device name and the `devices.naming` parameter.

Example:  
For the device "Erker - Links Wohnzimmer – UG," **HomeAssistant** automatically creates the following entity ID for the component "Erker - Links":  
`cover.erker_links_wohnzimmer_ug_erker_links`

This approach simplifies the identification of entities. However, if the device name or room name is changed in the EverHome portal, all entities and associated automations and dashboards must also be updated. The language settings (see Chapter 7.1) also affect the entity ID.
