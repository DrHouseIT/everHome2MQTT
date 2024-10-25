# everHome2MQTT

**everHome2MQTT** is a software solution that enables integration of the **everHome Cloud** into **Home Assistant**.

## Overview

The **everHome Cloud** is a cloud-based platform offered by Everhome GmbH. You can learn more about it on the [everHome website](https://everhome.cloud). It allows you to monitor, control, and automate connected devices from anywhere via the CloudBox provided by Everhome.

**Home Assistant** is an open-source platform for smart home automation that enables users to integrate, control, and automate a variety of devices and services to create customized smart home solutions. Home Assistant offers an intuitively designed user interface through which complex automation processes can be configured to enhance comfort and efficiency in the home. For more information, visit the [Home Assistant website](https://www.home-assistant.io).

Currently, Home Assistant does not offer native integration for the **everHome Cloud**. **everHome2MQTT** fills this gap by establishing a connection between the everHome Cloud and Home Assistant.

## Components of everHome2MQTT

**everHome2MQTT** consists of two components:
- **Node-RED Flows**
- **everHome2MQTT Server**, programmed in **Node.js**

## What is Node-RED?

**Node-RED** is a browser-based platform for visual programming that allows you to easily create IoT applications. It provides a simple drag-and-drop interface for connecting various hardware devices, APIs, and online services. Node-RED is commonly used to implement automation processes in smart home systems. For more information, visit the [Node-RED website](https://nodered.org).

## Requirements for Running everHome2MQTT

To operate **everHome2MQTT**, the following add-ons must be installed:
- **Mosquitto Broker** (or an alternative)
- **Node-RED**
- **File Editor** (or an alternative for editing the `config.yaml` of everHome2MQTT) [Documentation for config.yaml](docs\Config.yaml\README.en.md)

### Note:
The software accesses the `homeassistant` directory, which is typically available in the Node-RED add-on. If Node-RED is not directly installed in **Home Assistant**, ensure that the `homeassistant` directory is accessible and has the appropriate read and write permissions.

## Installation

### Add-Ons:
1. **Mosquitto Broker**
2. **Node-RED Add-On**
   - **Important**: Disable SSL in the configuration before starting and save.
3. **File Editor**

### Download Files

To download the necessary files for the project, follow these steps:

1. **Use Tags**: The files are available in various versions as tags. You can download the latest version or a specific version by going to the **Tags** tab of the repository.
2. **Download ZIP File**: You can download the files as a ZIP archive by clicking on **Code** and then selecting **Download ZIP**. This will provide you with all the files in a compressed format.
3. **Extract**: Extract the ZIP file on your computer. The necessary files `everHome2MQTT.json` and `everHome2MQTT.js` are located in the extracted directory.

## Setup

### Node-RED:

#### 1. Install Modules  
To install the required modules, proceed as follows:

- Open the Node-RED user interface.
- Click on the **hamburger menu** (three horizontal lines) in the top right corner.
- Select **Manage palette**.
- Switch to the **Install** tab.
- Search for the following modules and install each by clicking the **Install** button:
  - `node-red-contrib-oauth2`
  - `node-red-contrib-ip`

The modules will now be downloaded and installed in Node-RED.

#### 2. Import Flows  
To import the flow `everHome2MQTT.json`, follow these steps:

- Click on the **hamburger menu** (three horizontal lines) in the top right corner.
- Select **Import**.
- In the following window, you can either upload the `everHome2MQTT.json` file directly or manually paste the content of the file.
  - Select the `everHome2MQTT.json` file and click **Import**.
- The flow will now be loaded into the user interface and can be used.

#### 3. Set Up MQTT Nodes  
- In the "everHome2MQTT Control" tab, click on any **MQTT node** (purple color) and edit the **server** via the pencil icon.
- In the **Security** tab, enter the username and password of the MQTT user.
  - Either a separate user can be used or the credentials of a Home Assistant user.

#### 4. Deploy Changes  
Once the flow and modules are set up, follow these steps to apply the changes and activate the project:

- Click the **Deploy** button (red field) in the top right corner.
- Ensure that all changes have been successfully applied and the flow is now active.
- If necessary, you can restart the flows or Node-RED to ensure that all connections and nodes work correctly:
   - **Restart Flows**: To restart the flows, simply click the Deploy button. This will reload all current flows and apply the changes.
   - **Restart Node-RED**: To restart Node-RED, go to the **Node-RED Add-On** in Home Assistant and click on **Stop**, then **Start**. This ensures that all flows and modules are correctly initialized.

### everHome2MQTT Server:
1. Copy the file `everHome2MQTT.js` to the folder `/homeassistant/everHome2MQTT/server`.
   - If the `everHome2MQTT` directory in `homeassistant` does not exist, there may have been an error in its creation, as the software should do this automatically.

## Authentication

An authentication of the application with **everHome** must be done once:
1. Create a new application at [https://everhome.cloud/de/entwickler/anwendungen](https://everhome.cloud/de/entwickler/anwendungen).
2. Save the **Client Secret** and **Client ID** in a text file or similar.
3. To authenticate, enter the following URL in your browser: [http://homeassistant.local:3000](http://homeassistant.local:3000).
   - The web interface of everHome2MQTT should now open.
   - If this does not happen, please wait a moment. If the server is still unreachable after 1 minute, it may be that the port set for the server is already in use.
   - If that is the case, it will be logged in the Node-RED log as follows: _ERROR: Uncaught Exception: Error: listen EADDRINUSE: address already in use 0.0.0.0:3000_. To view the log of the Node-RED add-on in Home Assistant, navigate to Settings > Add-ons, select Node-RED from the list, and click on the "Logs" tab. There you can view the current logs and refresh them if needed.
   - Optionally, a different port can be defined in `/homeassistant/everHome2MQTT/config.yaml`. After that, the flows or Node-RED need to be restarted (see above).
4. On the web interface of the **everHome2MQTT server**, enter the saved **Client Secret** and **Client ID** in the form (note: do not swap the two values) and grant the application access.

## MQTT Integration

After successful authentication, the devices from **everHome** should be visible and controllable in the **MQTT integration** of Home Assistant.

---

**Note**: This solution currently does not offer complete official support from Home Assistant or everHome but is an unofficial solution. For more information, visit the [Home Assistant website](https://www.home-assistant.io).
