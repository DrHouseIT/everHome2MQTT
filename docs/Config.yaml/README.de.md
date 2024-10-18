# YAML Konfiguration

Die YAML-Konfigurationsdatei definiert die Einstellungen und Konfigurationen für **everHome2MQTT**. Sie umfasst verschiedene Abschnitte, welche die Konfigurationen für WebSocket, MQTT, Geräte, Untertypen und das Ausschließen von Geräten spezifizieren. Jeder Abschnitt enthält spezifische Parameter und Optionen, die die Funktionalität und das Verhalten des Systems steuern. Durch die Anpassung dieser Konfigurationen kann das Verhalten der Software individuell angepasst werden.

Beim ersten Start von **everHome2MQTT** wird automatisch eine Standarddatei erzeugt. Diese enthält bereits Voreinstellungen. Nach jeder manuellen Anpassung durch den Benutzer muss die Aktualisierungs-Funktion im Gerät **everHome2MQTT** ausgeführt werden. Falls Parameter eingegeben werden, die nicht plausibel sind oder außerhalb der erlaubten Grenzen liegen, werden Standardwerte gesetzt und die Datei wird neu gespeichert.

## 7.1 Spracheinstellungen

**language**  
Legt die Sprache fest, mit der Gerätetypen, Eigenschaften etc. übersetzt werden.  
**Standardwert:** `de`

## 7.2 Ports

**ports.nodeRed**  
Legt die Ports von Node-Red und dem **everHome2MQTT** Server fest. Falls der Node-Red-Port in der Add-on-Konfiguration angepasst wurde, muss dieser Port auch in der YAML-Konfiguration angepasst werden.  
**Standardwert:** `1880`

**ports.everHome2MQTT**  
Falls der Standard-Port auf dem **HomeAssistant** Host bereits verwendet wird, kann hier ein anderer Port definiert werden.  
**Standardwert:** `3000`

## 7.3 WebSocket-Einstellungen

**websocket.scan_interval**  
Legt das Intervall in Sekunden fest, in dem die WebSocket-Verbindung überprüft wird.  
**Minimalwert:** `1`  
**Maximalwert:** `60`  
**Standardwert:** `10`

## 7.4 MQTT-Einstellungen

**mqtt.scan_interval**  
Bestimmt das Intervall in Sekunden, in dem die MQTT-Verbindung überprüft wird.  
**Minimalwert:** `1`  
**Maximalwert:** `60`  
**Standardwert:** `10`

**mqtt.retain**  
Gibt an, ob MQTT-Nachrichten nach dem Neustart beibehalten werden sollen.  
Mögliche Werte:  
- **Aktiv:** `true`, `"true"`, `1`  
- **Inaktiv:** `false`, `"false"`, `0`

Das **Retain-Flag** kann für die folgenden Topic-Arten parametriert werden:  
- **config_topic:** Das MQTT-Topic für die Gerätekonfiguration.  
- **state_topic:** Das MQTT-Topic für Status-Aktualisierungen.  
- **command_topic:** Das MQTT-Topic zur Veröffentlichung von Befehlen.

**mqtt.retain.topics.config**  
**Standardwert:** `true`

**mqtt.retain.topics.state**  
**Standardwert:** `true`

**mqtt.retain.topics.command**  
**Standardwert:** `false`

## 7.5 Gerätekonfiguration

**devices.naming**  
Definiert das Namensschema für Geräte, wobei `<device_name>` und `<room_name>` durch den Gerätenamen und den Raumnamen ersetzt werden. Es wird empfohlen, immer den Geräte- und Raumnamen zu verwenden, um eine eindeutige Zuordnung der Geräte zu gewährleisten. Auf den Raumnamen kann verzichtet werden, wenn dieser bereits im Gerätenamen enthalten ist.

**devices.set_object_id**  
Legt fest, ob Objekt-IDs gesetzt werden sollen.  
Mögliche Werte:  
- **Aktiv:** `true`, `"true"`, `1`  
- **Inaktiv:** `false`, `"false"`, `0`  
**Standardwert:** `true`

Wenn die Option `object_id` aktiviert ist, wird eine von **everHome2MQTT** generierte ID verwendet. Diese setzt sich wie folgt zusammen:  
`everhome_device_id_13_subtype`

Diese Entitäts-ID ist ein Beispiel für das Gerät mit der ID 13 und dem Attribut „subtype“. Handelt es sich um eine Gruppe, wird `device` durch `group` ersetzt. Die Eindeutigkeit wird durch die ID und `device` bzw. `group` sichergestellt.

Wenn die Einstellung deaktiviert ist, wird eine Entitäts-ID von **HomeAssistant** erzeugt, die auf dem Gerätenamen und dem Parameternamen `devices.naming` basiert.

Beispiel:  
Bei dem Gerät „Erker - Links Wohnzimmer – UG“ erstellt **HomeAssistant** für die Komponente „Erker - Links“ automatisch die folgende Entitäts-ID:  
`cover.erker_links_wohnzimmer_ug_erker_links`

Diese Vorgehensweise erleichtert die Identifikation von Entitäten. Jedoch müssen bei einer Änderung des Gerätenamens oder Raumnamens im EverHome-Portal auch alle Entitäten und zugehörige Automatisierungen und Dashboards aktualisiert werden. Auch die Spracheinstellungen (siehe Kapitel 7.1) beeinflussen die Entitäts-ID.
