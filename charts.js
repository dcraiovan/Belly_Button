function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    console.log(data);
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    // Create a variable that holds the metadata array. 
    var metadata = data.metadata;

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var sampleArray = samples.filter(sampleObj => sampleObj.id == sample);
    //Create a variable that filters the metadata array for the object with the desired sample number.
    var metadataArray = metadata.filter(sampleObj => sampleObj.id == sample);

    //  5. Create a variable that holds the first sample in the array.
    var firstSample = sampleArray[0];
    // Create a variable that holds the first sample in the metadata array.
    var result = metadataArray[0];


    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otuIDs = firstSample.otu_ids;
    var otuLabels = firstSample.otu_labels; 
    var otuSampleValues = firstSample.sample_values;

    //Create a variable that holds the washing frequency.
     var wFreq = result.wfreq; 

     function intToFloat(num, decPlaces) { 
        return num + '.' + Array(decPlaces + 1).join('0');
       }
     var floatWashingFreq = intToFloat(wFreq,1);

    // 7. Create the yticks for the bar chart.
    // Created an object to hold the 3 variables in order to sort them 
    // all in a descending way and then slice the last 10 values of each one

   var charts = Array();

    for(var i=0; i<firstSample.otu_ids.length; i++) {
      charts.push({ 
        id:firstSample.otu_ids[i], 
        label: firstSample.otu_labels[i], 
        value: firstSample.sample_values[i] 
      });
    }
    
    console.log('Charts');
    //console.log(charts.map(c => c.value));

    //Sorting by values 
    var sortedCharts = charts.sort((p1,p2)=> { 
      return p1.value - p2.value;
      });

      //console.log('Sorted Values are');
      //console.log(sortedCharts.map(c => c.value));
  
      //Slicing top 10 values 
      var x = (sortedCharts.map(c => c.value)).slice(-10);
      var yID = (sortedCharts.map(c => c.id)).slice(-10);
      var hoverText = (sortedCharts.map(c => c.label)).slice(-10);

      //Create yticks values 
      var yticks = yID.map(a=> 'OTU '+ a);
      //console.log(yID);
      //console.log(yticks);

    // 8. Create the trace for the bar chart.   
    var barData = [{
      x: x,
      y: yticks,
      text: hoverText,
      type: 'bar',
      orientation: 'h' 
     }];

    // 9. Create the layout for the bar chart. 
    var barLayout = {
     paper_bgcolor: '#FFFFFF57',
     title: 'Top 10 Bacteria Cultures Found'
    };

    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot('bar', barData, barLayout);

   // Bar and Bubble charts
    // 1. Create the trace for the bubble chart.
    console.log(otuIDs.filter((item,
      index) => otuIDs.indexOf(item) === index));
    var bubbleData = [{
      x: otuIDs,
      y: otuSampleValues,
      text: otuLabels,
      mode:'markers',
      marker: {
        color: otuIDs.map(id => numberToColour(id*1000)),
        size: otuSampleValues
      }
   }];
   console.log(otuIDs);

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      paper_bgcolor: '#FFFFFF57',
      title:'Bacteria Cultures Per Sample',
      xaxis: {title:'OTU ID'},
      width: 1184,
      showlegend: false
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot('bubble', bubbleData, bubbleLayout ); 

    // 4. Create the trace for the gauge chart.
    var gaugeData = [{ 
      title: {
        text:'<b>Belly Button Washing Frequency</b><br>Scrubs per week',
      },
      domain: { x: [0, 1], y: [0, 1] },
      value: floatWashingFreq,
      type: "indicator",
      mode: "gauge+number",
      delta: { reference: 380 },
      gauge: {
        axis: { range: [null, 10] },
        bar: { color: "black" },
        borderwidth: 2,
        bordercolor: "black",
        steps: [
          {range: [0, 2], color: "red"},
          {range: [2, 4], color: "orange"},
          {range: [4, 6], color: "yellow"},
          {range: [6, 8], color: "rgb(144, 238, 144)"},
          {range: [8, 10], color: "green"}
        ] 
      }
    }];
  
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = {
      paper_bgcolor: '#FFFFFF57',
      width: 500,
      height: 450,
    };

    // 6. Use Plotly to plot the gauge data and layout.
    // var PANEL = d3.select("#col-md-5");
    // PANEL.append("h5").text('Belly Button Washing Frequency');
    // PANEL.append("h6").text('Scrubs per week');
    Plotly.newPlot('gauge',gaugeData, gaugeLayout);


  });
};

function numberToColour(number) {
  const r = (number & 0xff0000) >> 16;
  const g = (number & 0x00ff00) >> 8;
  const b = (number & 0x0000ff);
  
  return 'rgb('+r+', '+g+', '+b+')';
}