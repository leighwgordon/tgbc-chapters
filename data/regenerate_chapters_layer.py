#!/usr/bin/env python

import logging
import re

import geojson
import requests
from bs4 import BeautifulSoup

logging.basicConfig(format='%(asctime)s - %(message)s', level=logging.INFO)

FIND_US_URL = 'http://toughguybookclub.com/find-us'
MAP_PATTERN = re.compile(r"^https://www\.google\.com?(\.[^/]+)?/maps/place/[^/]+/@(?P<lat>[^,]+),(?P<lon>[^,]+),(?P<zoom>\d+)z/.*$")


def get_chapter_feature(city):
    chapter = city.find('h5').contents[0]
    address = city.select_one('a[href*="/maps/place/"]')

    if not address:
        logging.warning("Skipping '{}' chapter, missing maps URL".format(chapter))
        return None


    try:
        matches = MAP_PATTERN.match(address['href']).groupdict()
    except AttributeError:
        logging.warning("Skipping '{}' chapter, unable to extract coordinates from URL '{}'".format(chapter, address.get('href')))
        return None
        
    coordinates = (float(matches['lon']), float(matches['lat']))

    logging.info("Adding '{}' chapter with coordinates {}".format(chapter, coordinates))
    point = geojson.Point(coordinates)
    feature = geojson.Feature(geometry=point,
                              properties={'popupContent': "{} - {}".format(chapter, address.text)})
    return feature


def main():
    r = requests.get(FIND_US_URL)
    soup = BeautifulSoup(r.text, features='html.parser')
    features = (get_chapter_feature(c) for c in soup.find_all('div', 'meetup-city'))
    collection = geojson.FeatureCollection([c for c in features if c])
    with open('chapters.json', 'w') as f:
        geojson.dump(collection, f, sort_keys=True, indent=4, separators=(',', ': '))


if __name__ == '__main__':
    main()
