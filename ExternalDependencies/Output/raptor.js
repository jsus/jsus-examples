/*
---
 
script: Color.js
 
description: A library to work with colors
 
license: MIT-style license
 
authors:
- Valerio Proietti
 
provides: [Color]
 
...
*/
/*
---
 
script: Class.js
 
description: Contains the Class Function for easily creating, extending, and implementing reusable Classes.
 
license: MIT-style license.

provides: [Class]
 
...
*/
/*
---
 
script: Hash.js
 
description: Contains the Hash extensions for objects
 
license: MIT-style license.
 
requires:
- Class/Class
 
provides: [Hash]
 
...
*/
/*
---
 
script: Mash.js
 
description: Contains the Mash extensions for objects
 
license: MIT-style license.
 
requires:
- Hash/Hash
 
provides: [Mash]
 
...
*/
/*
---
 
script: Widget.js
 
description: An abstract class for all your widgets out there.
 
license: MIT-style license
 
authors:
- Yaroslaff Fedin
 
requires: 
- Class/Class
- Mash/Mash
 
provides: [Widget]
 
...
*/
/*
---
 
script: Input.js
 
description: Basic input class
 
license: MIT-style license
 
authors:
- Yaroslaff Fedin
 
requires:
- Widget
 
provides: [Input]
 
...
*/
/*
---
 
script: Input.Color.js
 
description: Cool colorpicker for everyone to enjoy
 
license: MIT-style license
 
authors:
- Yaroslaff Fedin
 
requires:
- Input
- Color
 
provides: [Input.Color]
 
...
*/