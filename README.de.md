# everHome2MQTT

**everHome2MQTT** ist eine Softwarelösung, die es ermöglicht, die **everHome Cloud** in **Home Assistant** zu integrieren.

## Überblick

Die **everHome Cloud** ist eine cloudbasierte Plattform, die von der Firma Everhome GmbH angeboten wird. Du kannst mehr darüber auf der [everHome-Website](https://everhome.cloud) erfahren. Sie ermöglicht es, über die von Everhome angebotene CloudBox vernetzte Geräte von überall aus zu überwachen, zu steuern und zu automatisieren.

**Home Assistant** ist eine quelloffene Plattform für Smart-Home-Automatisierung, die es Anwendern ermöglicht, eine Vielzahl von Geräten und Diensten zu integrieren, zu steuern und zu automatisieren, um individuelle Smart-Home-Lösungen zu realisieren. Home Assistant bietet eine intuitiv gestaltete Benutzeroberfläche, über die komplexe Automatisierungsabläufe konfiguriert werden können, um den Komfort und die Effizienz in den eigenen vier Wänden zu optimieren. Weitere Informationen findest du auf der [Home Assistant-Website](https://www.home-assistant.io).

Aktuell bietet Home Assistant keine native Integration für die **everHome Cloud**. **everHome2MQTT** schließt diese Lücke, indem es eine Verbindung zwischen der everHome Cloud und Home Assistant herstellt.


## Bestandteile von everHome2MQTT

**everHome2MQTT** besteht aus zwei Komponenten:
- **Node-RED Flows**
- **everHome2MQTT-Server**, programmiert in **Node.js**

## Was ist Node-RED?

**Node-RED** ist eine browserbasierte Plattform zur visuellen Programmierung, die es ermöglicht, IoT-Anwendungen einfach zu erstellen. Sie bietet eine einfache Drag-and-Drop-Oberfläche, um verschiedene Hardwaregeräte, APIs und Online-Dienste zu verbinden. Node-RED wird häufig verwendet, um Automatisierungsabläufe in Smart-Home-Systemen zu implementieren. Weitere Informationen findest du auf der [Node-RED-Website](https://nodered.org).

## Voraussetzungen für den Betrieb von everHome2MQTT

Damit **everHome2MQTT** betrieben werden kann, müssen folgende Add-Ons installiert sein:
- **Mosquitto Broker** (oder eine Alternative)
- **Node-RED**
- **File-Editor** (oder eine Alternative zum Bearbeiten der `config.yaml` von everHome2MQTT)

### Hinweis:
Die Software greift auf das Verzeichnis `homeassistant` zu, das standardmäßig im Node-RED Add-On verfügbar ist. Sollte Node-RED nicht direkt in **Home Assistant** installiert sein, muss sichergestellt werden, dass das `homeassistant`-Verzeichnis erreichbar ist und die entsprechenden Lese- und Schreibrechte vorhanden sind.

## Installation

### Add-Ons:
1. **Mosquitto Broker**
2. **Node-RED Add-On**
   - **Wichtig**: Vor dem Start SSL in der Konfiguration deaktivieren und speichern.
3. **File-Editor**

### Dateien herunterladen

Um die notwendigen Dateien für das Projekt herunterzuladen, gehe wie folgt vor:

1. **Tags verwenden**: Die Dateien sind in verschiedenen Versionen als Tags verfügbar. Du kannst die neueste Version oder eine bestimmte Version herunterladen. Gehe dazu in den Reiter **Tags** des Repositories.
2. **ZIP-Datei herunterladen**: Du kannst die Dateien als ZIP-Archiv herunterladen, indem du auf **Code** klickst und dann **Download ZIP** auswählst. Dadurch erhältst du alle Dateien in einer komprimierten Form.
3. **Entpacken**: Entpacke die ZIP-Datei auf deinem Computer. Die notwendigen Dateien `everHome2MQTT.json` und `everHome2MQTT.js` befinden sich im entpackten Verzeichnis.

## Einrichtung

### Node-RED: 

#### 1. Module installieren  
Um die benötigten Module zu installieren, gehe wie folgt vor:

- Node-RED Benutzeroberfläche öffnen.
- Klicke oben rechts auf das **Burgermenü** (drei horizontale Linien).
- Wähle **Palette verwalten** aus.
- Wechsle zum **Reiter Installation**.
- Suche nach den folgenden Modulen und installiere sie jeweils durch Klicken auf den **Installieren-Button**:
  - `node-red-contrib-oauth2`
  - `node-red-contrib-ip`

Die Module werden nun heruntergeladen und in Node-RED installiert.

#### 2. Flows importieren  
Um den Flow `everHome2MQTT.json` zu importieren, folge diesen Schritten:

- Klicke oben rechts auf das **Burgermenü** (drei horizontale Linien).
- Wähle **Importieren** aus.
- Im folgenden Fenster kannst du die Datei `everHome2MQTT.json` entweder direkt hochladen oder den Inhalt der Datei manuell einfügen.
  - Wähle die Datei `everHome2MQTT.json` und klicke auf **Importieren**.
- Der Flow wird nun in die Benutzeroberfläche geladen und kann verwendet werden.

#### 3. MQTT Knoten einrichten  
- Im Reiter "everHome2MQTT Control" auf einen beliebigen **MQTT-Knoten** klicken (lila Farbe) und den **Server** über das Stiftsymbol bearbeiten.
- Im Reiter **Sicherheit** den Benutzernamen und das Passwort des MQTT-Nutzers eingeben.
  - Hier kann entweder ein separater Nutzer verwendet werden oder die Zugangsdaten eines Home Assistant Nutzers.

#### 4. Übernahme (deploy)  
Nachdem der Flow und die Module eingerichtet wurden, folge diesen Schritten, um die Änderungen zu übernehmen und das Projekt zu aktivieren:

- Klicke oben rechts auf den **Deploy-Button** (rotes Feld).
- Stelle sicher, dass alle Änderungen erfolgreich übernommen wurden und der Flow nun aktiv ist.
- Falls nötig, kannst du die Flows oder Node-RED neu starten, um sicherzustellen, dass alle Verbindungen und Knoten korrekt arbeiten:
   - **Flows neu starten**: Um die Flows neu zu starten, klicke einfach auf den Deploy-Button. Dadurch werden alle aktuellen Flows neu geladen und die Änderungen wirksam.
   - **Node-RED neu starten**: Wenn du Node-RED neu starten möchtest, gehe zum **Node-RED Add-On** in Home Assistant und klicke auf **Stop** und dann auf **Start**. Dies stellt sicher, dass alle Flows und Module korrekt initialisiert werden.

### everHome2MQTT-Server:
1. Die Datei `everHome2MQTT.js` in den Ordner `/homeassistant/everHome2MQTT/server` kopieren.
   - Falls das Verzeichnis `everHome2MQTT` in `homeassistant` nicht existiert, wurde möglicherweise ein Fehler beim Anlegen gemacht, da die Software dies automatisch tun sollte.

## Authentifizierung

Einmalig muss eine Authentifizierung der Anwendung bei **everHome** erfolgen:
1. Eine neue Anwendung unter [https://everhome.cloud/de/entwickler/anwendungen](https://everhome.cloud/de/entwickler/anwendungen) anlegen.
2. **Client Secret** und **Client ID** in einer Textdatei oder ähnlichem speichern.
3. Zur Authentifizierung im Browser Seite [http://homeassistant.local:3000](http://homeassistant.local:3000) eingeben.
   - Sollte der Port 3000 bereits belegt sein, kann in der `/homeassistant/everHome2MQTT/config.yaml` ein anderer Port definiert werden.
   - Danach die Flows neu starten oder Node-RED neu starten (siehe oben).
4. Auf der Weboberfläche des **everHome2MQTT-Servers** die gespeicherten **Client Secret** und **Client ID** in das Formular eintragen (Achtung: Die beiden Werte nicht vertauschen) und der Anwendung Zugriff gewähren.

## MQTT-Integration

Nach erfolgreicher Authentifizierung sollten die Geräte von **everHome** in der **MQTT-Integration** von Home Assistant sichtbar und steuerbar sein.

---

**Hinweis**: Diese Lösung bietet derzeit keine vollständige offizielle Unterstützung durch Home Assistant oder everHome, sondern ist eine inoffizielle Lösung. Weitere Informationen findest du auf der [Home Assistant-Website](https://www.home-assistant.io).
