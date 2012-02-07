====================
Change Street Scenes
====================

A scene refers to an entire stretch of change street, beginning to end.

Scene Data
----------

A scene needs several pieces:

- A list of **things**
- A list of **messages**
- A list of **bubbles**
- A **projection matrix**
- A **"buffer" element**

Things
******
Things are the objects that appear in the scene. All things have ``x``, ``y``,
and ``z`` coordinates that can be either scalar values, or functions that take
parameters ``t`` (think of it as time) and ``$el`` (the element that corresponds
to this thing in the rendered scene.

Things also have a ``type``. What happens with this type is dependent on how the
scene is rendered. for an ``SVGScene``, the renderer will look for an element
with an id of ``<type>-template``, clone that element, and use it as the element
that represents the thing, and each of the elements representing things will
also be given a class corresponding to their type name.

Thing templates in an ``SVGScene``:
"""""""""""""""""""""""""""""""""""
An SVGScene creates a ``<use />`` element for each scene thing. In order to be
available to be referenced, each of the things that are ``use``-able -- the
templates -- live in a ``<defs>...</defs>`` element. This raises the question:
should the templates be ``<image />`` elements, or the actual contents of the
SVG files? Different approaches make sense, depending on the image.

- For things that have a large bounding box with lots of empty space (think
  roads, sidewalks, bikelanes), the elements should be copied from the source
  file and pasted into the html file. This will allow the browser to know about
  the negative space in the image. Then, for mouse events, only the actual stuff
  in the image will matter.

- For smaller objects, especially if they have a lot of negative space, use an
  ``<image />`` tag. These objects could stand to be identified by their
  bounding box rather than their filled-in space. A tree comes to mind. So much
  negative space in between the leaves, it's difficult to know where to click.
  And for a bike rack, you don't want to have to click right on the metal part.

Messages
********
Messages appear in a box on the screen, not attached to any particular thing.
Each message has a ``label`` string, a ``content`` string, a ``start`` and an
``end``. The start and end specify the "times" between which the message will be
visible.

Bubbles
*******
Bubbles appear in a box "attached" to a thing. Each bubble has a ``label``
string, a ``content`` string, and a ``selector`` specifying the element to which
the bubble will be attached. Additionally, they may have a ``start`` and
``end``. If they do, these will be treated the same as for messages.

Projection Matrix
*****************


Requesting a Scene
------------------

Data sent from the server will contain the scene components, each with the
necessary information to correctly place the element in the scene as well as
whatever information that has been entered about the elements (i.e., "Street
trees are maintained by ..."). Something like:

**http://<streetwise>/api/1/scene?location=<location string>**

- Method: *GET*
- Response (scene)::

    {
        style : [
            'night time',
            'snowy'
        ],
        bubbles: [
            { selector: '.tree', label: 'Street Trees', content: '<p>...</p>'},
            { selector: '.fire-hydrant', label: '...', content: '...' }
        ]
        things: [
            { type : 'tree', position : [0, 0, 0] },
            { type : 'fire-hydrant', position : [5, 0, 0] },
    ...

So, what's in here:
-------------------

- **Style**: A list of strings describing the scene conditions. How
  light/dark is it, what's the weather, is it a holiday, ...
- **Thing Type**: The type will mostly influence the image chosen to
  represent the element. We will define all the types that we use.

  An incomplete list of types:

  - tree
  - tree planter
  - side walk
  - bike rack
  - fire hydrant
  - bike lane
  - litter
  - block party
  - graffiti
  - traffic light
  - street sign
  - transit stop/station
  - bench
  - speed bump
  - trash can
  - street light
  - police officer

- **Thing Position**: This refers to the element's position in the scene.
  We could think of them roughly as ``[x, y, z]`` coordinates. Let's assume
  that all y-coords are going to be 0 for now. The z-coord can just be a
  layer designation (corresponding to a ``z-index`` style, for instance).
  The x- and y-coords can be in whatever units we want (not necessarily
  pixels) -- maybe 100-pixel blocks on full-size screens, 50-pixel blocks on
  mobile screens.
- **Information Bubbles**: I actually don't like the idea of having users
  enter markup, but the data has to get around some way. Formats to
  consider: html, markdown (with `showdown.js`_), ... What about just using
  pre-specified fields? Might be appropriate for some types of elements, but
  it might be too constraining. We should maybe start with pre-specified
  fields, and use a more free form necessary.

A scene description may contain more than will be displayed on the screen at any
one time (the screen should scroll), but the description could get quite heavy
if we include everything at once.  Might need to play around with pagination or
bounding of some sort -- like:

**http://<streetwise>/api/1/scene?location=...&minx/y/z=...&maxx/y/z=...**


Constructing Scene Data
-----------------------

Where do we get data from?
**************************
For weather, obviously we could go to the national weather service. What about
international locations? Is this strictly national app? Does NWS do
international weather? Either way, we can start there.

Location comes from the user's browser or IP address. If it can't be determined
from either of those sources, have the user enter in an address/location and
geolocate it using `some service`_.

For things like what buildings and features are around, we can use population
density from the census to determine the number, type, and density of houses.

For information about the elements in the scene, we could rely completely on our
own data set of information. Where data is available, we can use/scrape it to
prepopulate whatever we can.

.. _some service: Yonder_


How do we put it together
*************************
Each bit of information will be stored with an area of geographic relevance.

- How do we store it?  Do we store it?
- What processing do we need to do?


Rendering the scene
-------------------

The rendering for the scene is taken care of all on the front-end. We grab the
description of the scene from the server and place the objects accordingly.

Should we go with vector graphics?
**********************************

- Will z-indexing be an issue with transparent PNGs? For example, if you
  have a tree with wide branches, is it going to cover everything behind
  it, even in the negative/transparent space?
- Android 2.x's browser doesn't like SVG. Will we have to do a PNG version
  anyway?

If we go vector, we use SVGWeb to display


Other considerations
--------------------

- Can we make this thing search index-able? If I search for "bike racks in
  Philly" in Google, is there any chance that I could be taken to a scene in
  Philadelphia with a bike rack pre-selected?

  The elements would have to be browsable; the application has to have site map
  somewhere. This is definitely possible, and we should do it! We should try to
  be `ARIA`_ compliant.


.. _ARIA: http://www.w3.org/WAI/intro/aria
.. _showdown.js:  https://github.com/coreyti/showdown
.. _Yonder: http://yonder.aaronogle.com/
