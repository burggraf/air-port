git log --pretty=format:"- %s (%an)" --abbrev-commit > changelog1.txt
awk '!a[$0]++' changelog1.txt > changelog2.txt
grep -vE '^(- Merge pull request|- Merge branch)' changelog2.txt > changelog.txt
rm changelog1.txt
rm changelog2.txt


