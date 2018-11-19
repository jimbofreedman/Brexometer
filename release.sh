#!/bin/bash
VERSION=`git describe --abbrev=0 --tags`
VERSION_BITS=(${VERSION//-/ })
VNAME=${VERSION_BITS[0]]}
VNUM=${VERSION_BITS[1]}
VNUM=$((VNUM+1))
printf -v VNUM "%04g" $VNUM
TS=`gdate -u +"%Y%m%d%H%M%S"`
NEW_TAG="$VNAME-$VNUM-$TS"

echo "Updating $VERSION to $NEW_TAG"


GIT_COMMIT=`git rev-parse HEAD`
NEEDS_TAG=`git describe --contains $GIT_COMMIT`

if [ -z "$NEEDS_TAG" ]; then
    echo "Tagged with $NEW_TAG (Ignoring fatal:cannot describe - this means commit is untagged) "
    git tag $NEW_TAG
    git push --tags
    amplify publish
else
    echo "Already a tag on this commit"
fi
