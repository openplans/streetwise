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
