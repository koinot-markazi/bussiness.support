ymaps.ready()
    .done(function (ym) {
        var myPlacemark,
            myMap = new ym.Map('YMapsID', {
            center: [41.32840930162856, 69.24338355891037],
            zoom: 12
        },
        {
            searchControlProvider: 'yandex#search'
        });

        jQuery.getJSON('data.json', function (json) {
            /** Сохраним ссылку на геообъекты на случай, если понадобится какая-либо постобработка.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/GeoQueryResult.xml
             */
            var geoObjects = ym.geoQuery(json)
                    .addToMap(myMap)
                    .applyBoundsToMap(myMap, {
                        checkZoomRange: true
                    });
        });

            // Слушаем клик на карте.
        myMap.events.add('click', function (e) {
            var coords = e.get('coords');

            // Если метка уже создана – просто передвигаем ее.
            if (myPlacemark) {
                myPlacemark.geometry.setCoordinates(coords);
            }
            // Если нет – создаем.
            else {
                myPlacemark = createPlacemark(coords);
                myMap.geoObjects.add(myPlacemark);
                // Слушаем событие окончания перетаскивания на метке.
                myPlacemark.events.add('dragend', function () {
                    getAddress(myPlacemark.geometry.getCoordinates());
                });
            }
            getAddress(coords);
            console.log(coords[1] + ', ' + coords[0]);
            $('#locationData').val(coords[1] + ', ' + coords[0]);
            $('#getLocation').val('Выбрано');
            $('#getLocation').removeClass('btn-primary');
        });

        // Создание метки.
        function createPlacemark(coords) {
            return new ymaps.Placemark(coords, {
                iconCaption: 'поиск...'
            }, {
                preset: 'islands#nightCircleDotIcon',
                draggable: true
            });
        }

            // Определяем адрес по координатам (обратное геокодирование).
        function getAddress(coords) {
            myPlacemark.properties.set('iconCaption', 'поиск...');
            ymaps.geocode(coords).then(function (res) {
                var firstGeoObject = res.geoObjects.get(0);

                myPlacemark.properties
                    .set({
                        // Формируем строку с данными об объекте.
                        iconCaption: [
                            // Название населенного пункта или вышестоящее административно-территориальное образование.
                            firstGeoObject.getLocalities().length ? firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                            // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                            firstGeoObject.getThoroughfare() || firstGeoObject.getPremise()
                        ].filter(Boolean).join(', '),
                        // В качестве контента балуна задаем строку с адресом объекта.
                        balloonContent: firstGeoObject.getAddressLine()
                    });
            });
        }

    });

    $("#getLocation").click(function() {
        $('html,body').animate({
            scrollTop: $("#slowSlide").offset().top},
            'slow');

            if($('#locationData').val() != ''){
                $('#getLocation').val('Выбрано');
            }
            else{
                console.log('empty')
            }
    });

    $('.phone').mask('+000-(00)-000-00-00');

