"use strict";
const chalk = require('chalk');

// Use the Azure IoT device SDK for devices that connect to Azure IoT Central. 
var iotHubTransport = require('azure-iot-device-mqtt').Mqtt;
var Client = require('azure-iot-device').Client;
var Message = require('azure-iot-device').Message;
var ProvisioningTransport = require('azure-iot-provisioning-device-mqtt').Mqtt;
var SymmetricKeySecurityClient = require('azure-iot-security-symmetric-key').SymmetricKeySecurityClient;
var ProvisioningDeviceClient = require('azure-iot-provisioning-device').ProvisioningDeviceClient;
var provisioningHost = 'global.azure-devices-provisioning.net';

// Enter your Azure IoT keys (keys are hidden from the public)
var idScope = 'scope1';
var registrationId = 'Lot1';
var symmetricKey = 'key1...';

var provisioningSecurityClient = new SymmetricKeySecurityClient(registrationId, symmetricKey);
var provisioningClient = ProvisioningDeviceClient.create(provisioningHost, idScope, new ProvisioningTransport(), provisioningSecurityClient);
var hubClient;

var ParkingNumber = "Lot 1A";

//Coloring
function greenMessage(text) 
{
    console.log(chalk.green(text) + "\n");
}
function redMessage(text) 
{
    console.log(chalk.red(text) + "\n");
}

//variables to simulate the device.
var noEvent;
var eventText = 'Lorem ipsum event event';
var thisLotState = 'nocar';

//just to simulate cars coming and going, if there is a car it will be updated to no car and vice versa. 
function simulate()
{
    if(thisLotState == 'car') 
    {
        thisLotState = 'nocar';
    }
    else 
    {
        thisLotState = 'car';
    }
}

function sendParkingSpotTelemetry() 
{

    // Simulate the parking lot data every 15 seconds. 
    setInterval(simulate, 15 * 1000);

    // Create the telemetry data JSON package. 
    var data = JSON.stringify
    (
        {
            // Format is: 
            // Name from IoT Central app ":" variable name from NodeJS app. 
            lotState: thisLotState,
    });

    // Add the eventText event string, if there is one. 
    if (eventText != noEvent) 
    {
        data += JSON.stringify
        (
            {
                Event: eventText,
            }
        );
        eventText = noEvent;
    }

    // Create the message with the above defined data. 
    var message = new Message(data);
    console.log("Message: " + data);

    // Send the message. 
    hubClient.sendEvent(message, function (errorMessage) 
    {
        // Error 
        if (errorMessage) 
        {
            redMessage("Failed to send message to Azure IoT Central: ${err.toString()}");
        } 
        else 
        {
            greenMessage("Telemetry sent");
        }
    });
}

// Send device twin reported properties. 
// Each device must have a propertie, in this device's case its Lot 1A.
function sendDeviceProperties(twin, properties) 
{
    twin.properties.reported.update(properties, (err) => greenMessage(`Sent device properties: ${JSON.stringify(properties)}; ` +
        (err ? `error: ${err.toString()}` : `status: success`)));
}

// Handle device connection to Azure IoT Central. 
var connectCallback = (err) => 
{
    if (err) 
    {
        redMessage(`Device could not connect to Azure IoT Central: ${err.toString()}`);
    } 
    else 
    {
        greenMessage('Device successfully connected to Azure IoT Central');

        // Send telemetry to Azure IoT Central every 10 seconds. 
        setInterval(sendParkingSpotTelemetry, 10 * 1000);

        // Get device twin from Azure IoT Central. 
        hubClient.getTwin((err, twin) => 
        {
            if (err) {
                redMessage(`Error getting device twin: ${err.toString()}`);
            } else {

                // Send device properties once on device start up. 
                var properties =
                {
                    // Format is: 
                    // <Property Name in Azure IoT Central> ":" <value in Node.js app> 
                    LotID: ParkingNumber,
                };
                sendDeviceProperties(twin, properties);
            }
        });
    }
};

// Start the device (register and connect to Azure IoT Central). 
provisioningClient.register((err, result) => 
{
    if (err) 
    {
        redMessage('Error registering device: ' + err);
    } 
    else 
    {
        greenMessage('Registration succeeded');
        console.log('Assigned hub= ' + result.assignedHub);
        console.log('DeviceId= ' + result.deviceId);
        var connectionString = 'HostName=' + result.assignedHub + ';DeviceId=' + result.deviceId + ';SharedAccessKey=' + symmetricKey;
        hubClient = Client.fromConnectionString(connectionString, iotHubTransport);
        hubClient.open(connectCallback);
    }
});

