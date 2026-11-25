import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(__file__))

# Set AI_PROVIDER to local for automated tests to guarantee zero network latency
os.environ["AI_PROVIDER"] = "local"
