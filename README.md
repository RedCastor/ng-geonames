ng-geonames
=================

Geonames ( http://www.geonames.org )

Based on ui-leaflet directive structure ( https://github.com/angular-ui/ui-leaflet ).

<h4>Installing</h4>
```
bower install ng-geonames
```
```javascript
angular('yourAngularApp',['ngGeonames']);
```

<h4>Usage/Example</h4>
```html
<geonames defaults="geonamesDefaults" search="geonamesSearch" >
    <ui-select data-ng-model="geonamesSearch.selected" theme="bootstrap">
        <ui-select-match allow-clear="true" placeholder="Postal Code ...">{{$select.selected.title}}&nbsp;{{$select.selected.locationName}}</ui-select-match>
        <ui-select-choices refresh="geonamesSearch.q=$select.search" refresh-delay="1000" repeat="item in geonamesSearch.find">
            <span ng-bind-html="item.title | highlight: $select.search"></span>
            <small ng-bind-html="item.locationName | highlight: $select.search"></small>
        </ui-select-choices>
    </ui-select>
</geonames>
```
