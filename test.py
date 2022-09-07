import math
import os
import sys

import requests

print(sys.version)
print(sys.executable)

test = "hi"


def greet(who_to_greet):
    greeting = f"Hi {who_to_greet}"
    print(greeting)


greet("Yvonne")
greet("Denis")
