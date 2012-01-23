===============
StreetWise/Whys
===============

Scene Data
==========

Data sent from the server will contain the scene components, each with

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

**Style**: A list of strings describing the scene conditions. How light/dark is
it, what's the weather, is it a holiday, ...

**Element Type**: The type will mostly influence the image chosen to represent
the element. We will define all the types that we use.

An incomplete list of types:
    - trees
    - tree planters
    - side walks
    - bike racks
    - fire hydrants
    - bike lanes
    - litter
    - block parties
    - graffiti
    - traffic lights
    - street signs
    - transit stops/stations
    - bench
    - speed bump
    - trash can
    - street light
    - police officer

**Element Position**: This refers to the element's position in the scene. We
could think of them roughly as ``[x, y, z]`` coordinates. Let's assume that all
y-coords are going to be 0 for now. The z-coord can just be a layer designation
(corresponding to a ``z-index`` style, for instance). The coords can be in
whatever units we want (not necessarily pixels) -- maybe 100-pixel blocks on
screens above a certain size, 50-pixel blocks on mobile screens.

**Element information**: I actually don't like the idea of having users enter
markup, but the data has to get around some way. Formats to consider: html,
markdown (with showdown.js), ... What about just using pre-specified fields?
Might be appropriate for some types of elements, but it might be too
constraining.


Constructing Scene Data
=======================

- Where do we get data from?
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

If we go vector, we use SVGWeb
