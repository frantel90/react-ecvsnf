import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  Grid,
  GridColumn,
  GridDetailRow,
  GridToolbar,
  GridDetailRowProps,
  GridDataStateChangeEvent,
  GridExpandChangeEvent,
} from '@progress/kendo-react-grid';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { GridPDFExport } from '@progress/kendo-react-pdf';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import {
  IntlProvider,
  load,
  LocalizationProvider,
  loadMessages,
  IntlService,
} from '@progress/kendo-react-intl';

import likelySubtags from 'cldr-core/supplemental/likelySubtags.json';
import currencyData from 'cldr-core/supplemental/currencyData.json';
import weekData from 'cldr-core/supplemental/weekData.json';

import numbers from 'cldr-numbers-full/main/es/numbers.json';
import currencies from 'cldr-numbers-full/main/es/currencies.json';
import caGregorian from 'cldr-dates-full/main/es/ca-gregorian.json';
import dateFields from 'cldr-dates-full/main/es/dateFields.json';
import timeZoneNames from 'cldr-dates-full/main/es/timeZoneNames.json';

load(
  likelySubtags,
  currencyData,
  weekData,
  numbers,
  currencies,
  caGregorian,
  dateFields,
  timeZoneNames
);

import esMessages from './es.json';
loadMessages(esMessages, 'es-ES');

import { DataResult, process, State } from '@progress/kendo-data-query';
import orders from './orders.json';
import { Order } from './interfaces';

interface LocaleInterface {
  language: string;
  locale: string;
}

const DATE_FORMAT = 'yyyy-mm-dd hh:mm:ss.SSS';
const intl = new IntlService('en');

orders.forEach((o: Order) => {
  o.orderDate = intl.parseDate(
    o.orderDate ? o.orderDate : '20/20/2020',
    DATE_FORMAT
  );
  o.shippedDate = o.shippedDate
    ? undefined
    : intl.parseDate(
        o.shippedDate ? o.orderDate.toString() : '20/20/2020',
        DATE_FORMAT
      );
});

const DetailComponent = (props: GridDetailRowProps) => {
  const dataItem = props.dataItem;
  return (
    <div>
      <section style={{ width: '200px', float: 'left' }}>
        <p>
          <strong>Street:</strong> {dataItem.shipAddress.street}
        </p>
        <p>
          <strong>City:</strong> {dataItem.shipAddress.city}
        </p>
        <p>
          <strong>Country:</strong> {dataItem.shipAddress.country}
        </p>
        <p>
          <strong>Postal Code:</strong> {dataItem.shipAddress.postalCode}
        </p>
      </section>
      <Grid style={{ width: '500px' }} data={dataItem.details} />
    </div>
  );
};

const App = () => {
  const locales: LocaleInterface[] = [
    {
      language: 'en-US',
      locale: 'en',
    },
    {
      language: 'es-ES',
      locale: 'es',
    },
  ];
  const [dataState, setDataState] = React.useState<State>({
    skip: 0,
    take: 20,
    sort: [{ field: 'orderDate', dir: 'desc' }],
    group: [{ field: 'customerID' }],
  });
  const [currentLocale, setCurrentLocale] = React.useState<LocaleInterface>(
    locales[0]
  );
  const [dataResult, setDataResult] = React.useState<DataResult>(
    process(orders, dataState)
  );

  const dataStateChange = (event: GridDataStateChangeEvent) => {
    setDataResult(process(orders, event.dataState));
    setDataState(event.dataState);
  };

  const expandChange = (event: GridExpandChangeEvent) => {
    const isExpanded =
      event.dataItem.expanded === undefined
        ? event.dataItem.aggregates
        : event.dataItem.expanded;
    event.dataItem.expanded = !isExpanded;

    setDataResult({ ...dataResult });
  };

  let _pdfExport;
  const exportExcel = () => {
    _export.save();
  };

  let _export;
  const exportPDF = () => {
    _pdfExport.save();
  };

  return (
    <LocalizationProvider language={currentLocale.language}>
      <IntlProvider locale={currentLocale.locale}>
        <div>
          <ExcelExport
            data={orders}
            ref={(exporter) => {
              _export = exporter;
            }}
          >
            <Grid
              style={{ height: '700px' }}
              sortable={true}
              filterable={true}
              groupable={true}
              reorderable={true}
              pageable={{ buttonCount: 4, pageSizes: true }}
              data={dataResult}
              {...dataState}
              onDataStateChange={dataStateChange}
              detail={DetailComponent}
              expandField="expanded"
              onExpandChange={expandChange}
            >
              <GridToolbar>
                Locale:&nbsp;&nbsp;&nbsp;
                <DropDownList
                  value={currentLocale}
                  textField="language"
                  onChange={(e) => {
                    setCurrentLocale(e.target.value);
                  }}
                  data={locales}
                />
                &nbsp;&nbsp;&nbsp;
                <button
                  title="Export to Excel"
                  className="k-button k-primary"
                  onClick={exportExcel}
                >
                  Export to Excel
                </button>
                &nbsp;
                <button className="k-button k-primary" onClick={exportPDF}>
                  Export to PDF
                </button>
              </GridToolbar>
              <GridColumn field="customerID" width="200px" />
              <GridColumn
                field="orderDate"
                filter="date"
                format="{0:D}"
                width="300px"
              />
              <GridColumn field="shipName" width="280px" />
              <GridColumn field="freight" filter="numeric" width="200px" />
              <GridColumn
                field="shippedDate"
                filter="date"
                format="{0:D}"
                width="300px"
              />
              <GridColumn field="employeeID" filter="numeric" width="200px" />
              <GridColumn
                locked={true}
                field="orderID"
                filterable={false}
                title="ID"
                width="90px"
              />
            </Grid>
          </ExcelExport>
          <GridPDFExport
            ref={(element) => {
              _pdfExport = element;
            }}
            margin="1cm"
          >
            {
              <Grid
                data={process(orders, {
                  skip: dataState.skip,
                  take: dataState.take,
                })}
              >
                <GridColumn field="customerID" width="200px" />
                <GridColumn
                  field="orderDate"
                  filter="date"
                  format="{0:D}"
                  width="300px"
                />
                <GridColumn field="shipName" width="280px" />
                <GridColumn field="freight" filter="numeric" width="200px" />
                <GridColumn
                  field="shippedDate"
                  filter="date"
                  format="{0:D}"
                  width="300px"
                />
                <GridColumn field="employeeID" filter="numeric" width="200px" />
                <GridColumn
                  locked={true}
                  field="orderID"
                  filterable={false}
                  title="ID"
                  width="90px"
                />
              </Grid>
            }
          </GridPDFExport>
        </div>
      </IntlProvider>
    </LocalizationProvider>
  );
};

ReactDOM.render(<App />, document.querySelector('my-app'));
