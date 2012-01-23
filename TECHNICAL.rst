===============
StreetWise/Whys
===============

Scene Data
==========

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
        elements: [
            {
                type : 'tree',
                position : [0, 0, 0],
                information : {
                    format : 'markdown',
                    data : '''
                        Street Trees
                        ------------

                        Street trees are planted by the [Department of
                        Parks and Recreation][1].

                        Request a street tree [here][2].

                        [1] http://...
                        [2] http://...
                    '''
                }
            },
            {
                type : 'fire hydrant',
                position : [5, 0, 0],
                information : {
                    format : 'contact',
                    data : {
                        name : 'Clay Johnson',
                        organization : 'Infovegan.org',
                        url : 'http://www.infovegan.org/',
                        ...
                }
    ...

So, what's in here:
    - **Style**: A list of strings describing the scene conditions. How
      light/dark is it, what's the weather, is it a holiday, ...
    - **Element Type**: The type will mostly influence the image chosen to
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

    - **Element Position**: This refers to the element's position in the scene.
      We could think of them roughly as ``[x, y, z]`` coordinates. Let's assume
      that all y-coords are going to be 0 for now. The z-coord can just be a
      layer designation (corresponding to a ``z-index`` style, for instance).
      The x- and y-coords can be in whatever units we want (not necessarily
      pixels) -- maybe 100-pixel blocks on full-size screens, 50-pixel blocks on
      mobile screens.
    - **Element information**: I actually don't like the idea of having users
      enter markup, but the data has to get around some way. Formats to
      consider: html, markdown (with showdown.js), ... What about just using
      pre-specified fields? Might be appropriate for some types of elements, but
      it might be too constraining. We should maybe start with pre-specified
      fields, and use a more free form necessary.

A scene description may contain more than will be displayed on the screen at any
one time (the screen should scroll), but the description could get quite heavy
if we include everything at once.  Might need to play around with pagination or
bounding of some sort -- like:

**http://<streetwise>/api/1/scene?location=...&minx/y/z=...&maxx/y/z=...**


Constructing Scene Data
=======================

Where do we get data from?
--------------------------
For weather, obviously we could go to the national weather service. What about
international locations? Is this strictly national app? Does NWS do
international weather? Either way, we can start there.

Location comes from the user's browser or IP address. If it can't be determined
from either of those sources, have the user enter in an address/location and
geolocate it using `some service <http://yonder.aaronogle.com/>`_.

For things like what buildings and features are around, we can use population
density from the census to determine the number, type, and density of houses.

For information about the elements in the scene, we could rely completely on our
own data set of information. Where data is available, we can use/scrape it to
prepopulate whatever we can.

How do we put it together
-------------------------
Each bit of information will be stored with an area of geographic relevance.

- How do we store it?  Do we store it?
- What processing do we need to do?


Rendering the scene
===================

The rendering for the scene is taken care of all on the front-end. We grab the
description of the scene from the server and place the objects accordingly.

Should we go with vector graphics?
    - Will z-indexing be an issue with transparent PNGs? For example, if you
      have a tree with wide branches, is it going to cover everything behind
      it?
    - Android 2.x's browser doesn't like SVG. Will we have to do a PNG version
      anyway?

If we go vector, we use SVGWeb to display


Other considerations
====================

- Can we make this thing search index-able? If I search for "bike racks in
  Philly" in Google, is there any chance that I could be taken to a scene in
  Philadelphia with a bike rack pre-selected?

  The elements would have to be browsable; the application has to have site map
  somewhere. This is definitely possible, and we should do it! We should try to
  be `ARIA <http://www.w3.org/WAI/intro/aria>`_ compliant.
