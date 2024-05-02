#!/bin/bash

# Get the current year
current_year=$(date +"%Y")

# Ignore files and directories
ignore_files="(.git|node_modules|build|dist|temp|check_copyright.sh)"

# Directory to search; default is current directory, customize as needed
search_dir="."

# Pattern to look for: 'Copyright (c)'
pattern="Copyright (c)"

exit_code=0

# Find files containing the copyright notice
echo "Checking files in $search_dir for outdated copyright years..."
echo "Current year is $current_year."

# Use find to iterate over files, redirecting into while loop to avoid subshell
find $search_dir -type f -print0 > tmp.$$ || exit 1
while IFS= read -r -d $'\0' file; do
    # Skip files in the ignore list
    if [[ "$file" =~ $ignore_files ]]; then
        continue
    fi

    # Use grep to find the line and awk to extract the year
    year_line=$(grep "$pattern" "$file")

    if [[ -n "$year_line" ]]; then
        # Extract year assuming the year is after 'Copyright (c)'
        year=$(echo "$year_line" | grep -E -oh "[0-9]{4}-[0-9]{4}")
        year=$(echo "$year" | awk -F'-' '{print $2}')

        # Check if the extracted year is not equal to the current year
        if [[ "$year" -ne "$current_year" ]]; then
            echo "Outdated copyright year ($year) in file: $file"
            exit_code=1
        fi
    fi
done < tmp.$$
rm tmp.$$  # Clean up temporary file

echo "Check complete."
exit $exit_code

