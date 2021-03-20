let app = new Vue({
    delimiters: ["[[", "]]"],
    el: "#body",
    data: {
        // The object containing all data points
        data: null,
        
        // Utility method for parsing dates
        timeParser: null,

        // If the projection is enabled or not
        projected: false,

        numPeopleNeedToBeVaccinated: 8212885,

        predictedEndDate: null,
    },
    mounted: function() {
        this.data = window.globalData;
        this.timeParser = d3.timeParse("%Y-%m-%d");

        this.tooltip = d3.select("body").append("div");

        this.tooltip
            .attr("class", "tooltip")				
            .style("opacity", 0);

        this.setupSVG();

        this.processDates();

        this.createVisualisation();
    },
    methods: {
        setupSVG: function() {
            // set the dimensions and margins of the graph
            var margin = { top: 50, right: 50, bottom: 50, left: 100 };
            this.width = $("#viz").width() - margin.left - margin.right,
            this.height = Math.max($("#viz").height(), 400) - margin.top - margin.bottom;

            // append the svg object to the body of the page
            this.svg = d3.select("#viz")
                .append("svg")
                .attr("width", this.width + margin.left + margin.right)
                .attr("height", this.height + margin.top + margin.bottom)
                    .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        },
        processDates: function() {
            this.data.forEach((d) => {
                d.dateObj = this.timeParser(d.date);
            });

            this.dataTimeExtent = d3.extent(this.data, function(d) { return d.dateObj; });

            this.startDate = this.dataTimeExtent[0];
            this.endDate = this.dataTimeExtent[1];
            this.startValues = this.data.find((value) => {
                return this.startDate === value.dateObj;
            });
            this.endValues = this.data.find((value) => {
                return this.endDate === value.dateObj;
            });
            const differenceInValue = this.endValues.vaccinated - this.startValues.vaccinated;
            const differenceInDays = (this.endValues.dateObj - this.startValues.dateObj) / (1000 * 60 * 60 * 24);
            this.averageIncrease = differenceInValue / differenceInDays;
            const daysUntilPredictedEnd = Math.floor((this.numPeopleNeedToBeVaccinated - this.endValues.vaccinated) / this.averageIncrease);
            let predictedEnd = Date.parse(this.endValues.date) + daysUntilPredictedEnd * 1000 * 60 * 60 * 24
            this.predictedEndDate = d3.timeFormat("%Y-%m-%d")(predictedEnd);
            
            $("#startDateAvg").html(this.startValues.date);
            $("#endDateAvg").html(this.endValues.date);
            $("#avg").html(Math.floor(this.averageIncrease));

            this.midsummer = this.timeParser("2021-06-25");
            this.daysToMidsummer = Math.floor((this.midsummer - Date.now()) / (1000 * 60 * 60 * 24));
            this.avgNecessaryIncrease = Math.ceil((this.numPeopleNeedToBeVaccinated - this.endValues.vaccinated) / this.daysToMidsummer);

            $("#daysToMidsummer").html(this.daysToMidsummer);
            $("#numPeopleNeedToBeVaccinated").html(this.numPeopleNeedToBeVaccinated);
            $("#avgNecessaryIncrease").html(this.avgNecessaryIncrease);
        },
        toggleProjection: function() {
            this.projected = !this.projected;

            let x = this.updateXAxis(2000);
            let y = this.updateYAxis(2000);

            this.updateDataVis(2000, this.projected, x, y);
        },
        updateXAxis(animationTime) {
            let x = d3.scaleTime()
                .domain([ this.dataTimeExtent[0], this.projected ? this.midsummer : this.dataTimeExtent[1] ])
                .range([ 0, this.width ]);

            this.xAxis
                .attr("transform", "translate(0," + this.height + ")")
                .transition().duration(animationTime)
                .call(d3.axisBottom(x));

            return x;
        },
        updateYAxis(animationTime) {
            let y = d3.scaleLinear()
                .domain([ 0, this.projected ? this.numPeopleNeedToBeVaccinated : d3.max(this.data, function(d) { return +d.vaccinated; }) ])
                .range([ this.height, 0 ]);
            
            this.yAxis
                .transition().duration(animationTime)
                .call(d3.axisLeft(y));

            return y;
        },
        updateDataVis(animationTime, projected, x, y) {
            this.points
                .transition().duration(animationTime)
                .attr("r", projected ? 1.5 : 3.5)
                .attr("cx", function(d) { return x(d.dateObj); })
                .attr("cy", function(d) { return y(d.vaccinated); })
                .attr("fill", function(d) { return "black"; });

            this.line
                .transition().duration(animationTime)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 2.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.dateObj) })
                    .y(function(d) { return y(d.vaccinated) })
                );

            this.projection
                .transition().duration(animationTime)
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("opacity", this.projected ? 1 : 0)
                .attr("stroke-width", 2.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.dateObj) })
                    .y(function(d) { return y(d.vaccinated) })
                );

            this.projectionCurrent
                .transition().duration(animationTime)
                .attr("fill", "none")
                .attr("stroke", "blue")
                .attr("opacity", this.projected ? 1 : 0)
                .attr("stroke-width", 2.5)
                .attr("d", d3.line()
                    .x(function(d) { return x(d.dateObj) })
                    .y(function(d) { return y(d.vaccinated) })
                );
        },
        createVisualisation: function() {
            this.xAxis = this.svg.append("g");
            this.yAxis = this.svg.append("g");

            let x = this.updateXAxis(1000);
            let y = this.updateYAxis(1000);

            this.points = this.svg.selectAll("dot")
                .data(this.data)
                .enter().append("circle");

            const tooltip = this.tooltip;
            const displayTooltip = function(text, e) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .85);
                tooltip.html(text)
                    .style("left", (e.pageX + 20) + "px")
                    .style("top", (e.pageY - 28) + "px");
            };
            const hideTooltip = function() {
                d3.select(this)
                    .transition().duration(300)
                    .attr("r", this.projected ? 1.5 : 3.5);
                tooltip.transition()
                    .duration(300)
                    .style("opacity", 0);
            };
            const handleMouseOver = function(e, d) {
                d3.select(this)
                    .transition().duration(200)
                    .attr("r", this.projected ? 3.5 : 5.5);
                displayTooltip(d.date + " hade<br/>"  + d.vaccinated + " vaccinerats", e);
            };

            this.points
                .on("mouseover", handleMouseOver)
                .on("mouseout", hideTooltip);

            this.line = this.svg.append("path")
                .datum(this.data)

            this.projection = this.svg.append("path")
                .datum([ {
                    "dateObj": this.endValues.dateObj,
                    "vaccinated": this.endValues.vaccinated
                }, {
                    "dateObj": this.midsummer,
                    "vaccinated": this.numPeopleNeedToBeVaccinated
                } ])
                .on("mouseover", (e, d) => {
                    displayTooltip("Uteckling som krävs för <br>att hinna till midsommar", e);
                })
                .on("mouseout", hideTooltip);
            this.projectionCurrent = this.svg.append("path")
                .datum([ {
                    "dateObj": this.endValues.dateObj,
                    "vaccinated": this.endValues.vaccinated
                }, {
                    "dateObj": this.midsummer,
                    "vaccinated": this.endValues.vaccinated + this.daysToMidsummer * this.averageIncrease
                } ])
                .on("mouseover", (e, d) => {
                    displayTooltip("Nuvarande utveckling", e);
                })
                .on("mouseout", hideTooltip);
                
            this.updateDataVis(1000, this.projected, x, y);
        }
    }
});
