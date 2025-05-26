#!/bin/bash

# Nepali text to analyze
TEXT="कार्यक्रम पहिल्यै धवलशम्शेर, रवीन्द्र मिश्र र राप्रपाका कार्यकर्ताले प्रहरीमाथि ढुंगा प्रहार गरेका थिए : प्रसाईं राजावादीहरूले गत चैत १५ मा काठमाडौंको तीनकुनेमा गरेको प्रदर्शनमा प्रहरीमाथि ढुंगा प्रहार गर्नेमा राप्रपाका नेताहरू र सन्तोष राजावादीको टीम रहेको दुर्गा प्रसाईंले बयान दिएका छन् ।"

# URL encode the text
ENCODED_TEXT=$(echo "$TEXT" | jq -sRr @uri)

# Send POST request to analyze endpoint
curl -X POST http://localhost:3000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$TEXT\"}" \
  | jq '.'