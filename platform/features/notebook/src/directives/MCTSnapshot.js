/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2016, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

define(['zepto', 'dom-to-image'], function ($) {
    /**

     */
    function MCTSnapshot($rootScope,$document,exportImageService,dialogService,notificationService) {
        var document = $document[0];

        function link($scope, $element, $attrs) {
            var objectElement = $(document.body).find("[mct-object='navigatedObject']")[1],
                takeSnapshot,
                makeImg,
                saveImg;

            $(objectElement).addClass("s-status-taking-snapshot");

            takeSnapshot = function () {
                makeImg(objectElement);
            };

            makeImg = function (el) {
                var scope = $scope;
                var dialog = dialogService.showBlockingMessage({
                        title: "Saving...",
                        hint: "Taking Snapshot...",
                        unknownProgress: true,
                        severity: "info",
                        delay: true
                    });
                window.setTimeout(function () {
                    window.domtoimage.toBlob(el).then(function (img) {

                        if (img) {
                            if (dialog) {
                                dialog.dismiss();
                            }
                            if ($element[0].dataset.entry && $element[0].dataset.embed) {
                                saveImg(img, +$element[0].dataset.entry, +$element[0].dataset.embed);
                            } else {
                                var reader = new window.FileReader();
                                reader.readAsDataURL(img);
                                reader.onloadend = function () {
                                    $($element[0]).attr("data-snapshot", reader.result);
                                    $rootScope.snapshot = {'src': reader.result,
                                                                'type': img.type,
                                                                'size': img.size,
                                                                'modified': Date.now()
                                                            };
                                    scope.$destroy();
                                };
                            }

                        } else {
                            dialog.dismiss();
                        }

                    }, function (error) {
                        if (dialog) {
                            dialog.dismiss();
                        }
                    });

                    $(objectElement).removeClass("s-status-taking-snapshot");

                }, 500);
            };

            saveImg = function (url,entryId,embedId) {
                $scope.$parent.$parent.$parent.saveSnap(url, embedId, entryId);
            };

            takeSnapshot();

            $scope.$on('$destroy', function () {
                $element.remove();
            });
        }

        return {
            restrict: 'A',
            link: link
        };
    }

    return MCTSnapshot;

});
