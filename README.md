Multi-network LoRa switching API
---------------------------------

LoRa is a pretty nifty data exchange technology. Long range, low 
battery usage, simple-ish protocol, cheap hardware... What it fails 
at, however, is operator and network fragmentation.

This PoC highlights how to integrate a device (in this case, the 
[RFI LoRa remote power switch](http://www.rfi-engineering.com/index.php/remote-power-switch-3/) 
in a way that allows the user to set up their devices on either TTN 
or Loriot, leveraging a standard interface between the two.

Using this, anybody can set up a small API in order to leverage the power 
of either back-office, the test device, or inspire themselves from the 
code in order to build something for another sensor.

# The device

The Remote Power Switch is a very simple device. On a (configurable) time 
interval, it broadcasts its status. When this happens, the upstream 
LoRa back-office can relay a change of state; these changes of state 
take the form of a single byte, by implementation `0x01` to turn on, 
`0x00` to turn off.

# Implementation details

Both back-offices communicate through websockets and a RESTful API. In 
the case of TTN, their SDK provided a very quick solution for this.

In the case of Loriot, due to their lack of SDK or documentation, a 
raw `WebSocket` is used. This will be replaced soon by a slightly more 
expansive module.

Implementing an additional back-office is a simple matter of extending 
the `Module` pseudo-interface present in `src/communication/module.js`.

# Examples

A quick and dirty example is in `examples/multi-network-setup.js`. You 
will need to change the credentials to match your set-up.