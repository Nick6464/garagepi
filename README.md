# GaragePi
This is a write-up for 3 repos:

- GaragePi Frontend - [GaragePi Frontend Repo](https://github.com/Nick6464/garagepi-frontend)
- GaragePi Function App - [GaragePi Function App Repo](https://github.com/Nick6464/garagepi-func-app)
- GaragePi - [GaragePi Repo](https://github.com/Nick6464/GaragePi)

## Problem Statement
I've always hated having to carry around a cumbersome keychain with a garage door remote on it. I have a keyless entry car that uses my phone to lock and unlock, so I only need my keychain for opening the garage. The house I'm currently in doesn't have an indoor access garage, so I sadly can't just keep the control in my car, or I risk getting locked out. I want to be able to leave the remote in the house as a backup and have the primary method for opening the garage door be on my phone, like my car key.

## Hardware Plan
I've always wanted to use a Raspberry Pi for interacting with the world using GPIO rather than just as a small server. I should just be able to connect the GPIO pin to a cable and that's it, right? Oh, my sweet summer child Nick from a month ago. There's a little more to it than that.

Connecting directly to the garage door seemed dangerous and like it was an expensive mistake waiting to happen, especially considering this is my first time taking Electronics Theory and applying it. This was a decision I am happy went with. I instead decided to make the Pi simulate a button press on my garage door opener using a transistor controlled by the Pi's GPIO.

## Frontend Plan
I wanted a very simple frontend that was just a page with a single button, dark mode, and a logout option. I am most familiar with Azure so everything would be hosted there, including authentication. Using a React.js frontend and MUI buttons, the appearance was fast and easy. The authentication was what took me the longest. For JWT token authentication, I usually just use pre-made code that handles the flow for me. For this project, I saw it as a great opportunity to make the Auth Flow myself. After many iterations, I found that using a redirect was best for logins on Mobile, making the experience feel far smoother than I was expecting.

## Function App Plan
A request would be received by a Node.js Server hosted in an Azure Function app. The request would be checked for authenticity using signatures and the verify function from the jsonwebtoken library. Assuming the request has a valid JWT token and the right roles in Azure AD, it would be forwarded onto the Pi in my home network. The only need for the Function app is to obfuscate my home IP address since without it, the requests would be sent straight to my home network, which made the security side of me feel awful.

## Pi Server Plan
The Pi would also run a Node.js Server. I'm using a Pi 4 B. This is definitely overkill for this project, however, the choice was made since Node.js stopped support for ARMv6 in version 12 of Node. I discovered this late into the development cycle, after I'd already been testing and creating with the Pi 4 B. The Pi would receive the request with the user's JWT token which is forwarded by the Function App in the request. The same JWT token verification is done on the Pi as the Function App, just in case a request is somehow sent directly to the Pi. Assuming the JWT token is good, the verification in the middleware allows the function controlling the GPIO to continue. Using the onoff library, the Pi sets the selected Pin, in my case Pin 17, to be in high output mode for 0.25 seconds. I found this time to be about the same as a solid button press. The Pi then tells the Function App that it's worked. The Function App tells the Frontend, and I can get into my garage. Easy!

## Integration
I encountered some unforeseen issues during this phase. I can now see why Integration Hell is a commonly used term.

The first was the Pi Zero I wanted to use couldn't run the version of Node.js I had been using. I'll talk more about this in my Improvements section. This meant my board I wanted to keep for other projects, the Pi 4 B, was having to be used.

The Authentication flow was another major issue. I expected this though since it has to be perfect, given the fact this allows access to my car. I originally wasn't verifying the JWT signature and just checking if the Tenant ID was correct. I realized after about an hour of development that this could easily be spoofed by creating a fake JWT token with the same Tenant ID, which could be gained from the frontend code. I was quite proud that I'd caught this, given I made these connections myself. Breaking tools down is always where I gain the most experience.

The Pi OS was installed. I used a headless install, since I had no need for the desktop environment and it makes the Pi have one less thing to compute. Having the code start on boot was another requirement, given I didn't want to have to SSH into the pi every time it restarted. This would be a problem if my power went out while I was out in my car. I used pm2 to manage this. I followed the simple steps, and now the Node.js server would start on boot and be restarted if the code crashed.

After a long breadboarding session, I came up with a simple design using a single transistor. I was able to turn a light on using the full stack of code. This made me very optimistic for the install on the garage door opener. This optimism was sadly misplaced. On my first try, I mimicked the design exactly, but placed the transistor with the emitter on the positive terminal. Since I was also using power from the Pi, I fried a resistor connected to the button. Whoops.

After some more time to think, I decided to replace the battery on the garage remote board with the 3.3V pin of the Pi. This would also have the benefit of giving the 2 circuits a common ground. This worked perfectly.

I cannot explain the euphoria that I had seeing my garage door open. I live next to a sports field and I got this working on a Saturday, so I'm sure there were many people who thought I was crazy for being so excited about a garage door opening.

## Conclusion
I no longer need to carry any keys or keychain. Problem solved.
Here's a video of it in action.
[![Watch the video](https://img.youtube.com/vi/FSO7dGdYm10/hqdefault.jpg)](https://www.youtube.com/embed/FSO7dGdYm10)

[<img src="https://img.youtube.com/vi/FSO7dGdYm10/hqdefault.jpg" width="300" height="600" />](https://www.youtube.com/embed/FSO7dGdYm10)



## Epilogue/Improvements
Before I had even finished, there were already things I wanted to change.

I had no way for the Pi to check if the garage door was open or not. The Garage Door itself knows the position and displays it with an LED, which I could read, however, this is a potentially expensive mistake. A magnet sensor at the bottom of the door makes the most sense. The magnet on the door would be sensed by the sensor, indicating the door is closed. This could then be displayed on the frontend.

If you bump your garage door remote when you're out of the house, nothing happens since it's out of range. This is not the case for my solution. I've never used Geolocation in any projects before, so some kind of verification if the user is far from the door's coordinates is a software upgrade I could make. This is first on my list of improvements to be implemented.

Security is an aspect that interested me as well. The JWT token auth covers 90% of the security; however, garage doors are inherently vulnerable. Using a Flipper Zero, I was able to sniff the code that the garage door remote sent and then replay it. My door has rolling codes, so the door had to be out of range so the code wasn't rolled. This is a vulnerability that I could avoid by connecting the Pi directly to the garage door by simulating the button on the opener itself. Given I fried one remote opener, which was fixable, I'm not too keen on doing this, and I'm happy to accept the risk, since almost all garage doors have this same risk.

## Notes
This content represents the detailed plan, implementation, challenges, and reflections on improvements for a garage door opener project using a Raspberry Pi and Node.js, as explained by the project creator.
