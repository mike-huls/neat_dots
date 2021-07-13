class Obstacles {

    add_obstacle;
    // rectangles = [];
    lines = [
        {x1: 0, y1: 0, x2: canvas.width, y2: 0},    // top
        {x1: 0, y1: canvas.height, x2: canvas.width, y2: canvas.height},    // bottom
        {x1: 0, y1: 0, x2: 0, y2: canvas.height},    // left
        {x1: canvas.width, y1: 0, x2: canvas.width, y2: canvas.height},    // right
    ];
    linewidth = 15;

	constructor() {}

    /*
    load_level() {
        let cw = canvas.width;
        let ch = canvas.height;

        let level0 = [];

        let level1 = [
            {x: cw * 0.15, y: 0, w: 20, h: 150},
            {x: cw * 0.35, y: ch * .2, w: 20, h: 150},
            {x: cw * 0.70, y: ch*0.15, w: 20, h: 150},

            // // difficult
            {x: 0, y: ch*0.6, w: cw * 0.15, h: 20},
            {x: cw * 0.1, y: ch*0.7, w: cw * 0.25, h: 20},
            {x: cw * 0.6, y: ch*0.7, w: cw * 0.25, h: 20},
            
            {x: cw * 0.6, y: ch*0.7, w: cw * 0.35, h: 20},
            {x: cw * 0.3, y: ch*0.5, w: cw * 0.35, h: 20},

            {x: cw * 0.8, y: ch*0.9, w: 20, h: 120},
            {x: cw * 0.2, y: ch*0.9, w: 20, h: 120},
        ];
        let level2 = [
            // {x: cw * 0.15, y: 0, w: 20, h: 150},
            {x: cw * 0.35, y: ch * .2, w: 20, h: 150},
            {x: cw * 0.70, y: ch*0.15, w: 20, h: 150},

            // // // difficult
            // {x: cw * 0.1, y: ch*0.6, w: cw * 0.15, h: 20},
            // {x: cw * 0.1, y: ch*0.7, w: cw * 0.25, h: 20},
            // {x: cw * 0.6, y: ch*0.7, w: cw * 0.25, h: 20},
            
            {x: cw * 0.6, y: ch*0.7, w: cw * 0.35, h: 20},
            // {x: cw * 0.3, y: ch*0.5, w: cw * 0.35, h: 20},

            // {x: cw * 0.8, y: ch*0.9, w: 20, h: 120},
            {x: cw * 0.2, y: ch*0.45, w: 20, h: 150},
        ];

        let level3 = [
            // {x: cw * 0.15, y: 0, w: 20, h: 150},
            {x: cw * 0.35, y: ch * .2, w: 20, h: 150},
            {x: cw * 0.70, y: ch*0.15, w: 20, h: 150},            
            {x: cw * 0.6, y: ch*0.7, w: cw * 0.35, h: 20},
            {x: cw * 0.2, y: ch*0.45, w: 20, h: 150},
            {x: cw * 0.2, y: ch*0.45, w: 180, h: 20},
        ];



        let rectangles = [
            // Borders
            {x: 0, y: 0, h: ch, w: 1}, 
            {x: 0, y: 0, h: 1, w: cw}, 
            {x: cw, y: 0, h: ch, w: 1}, 
            {x: 0, y: ch, h: 1, w: cw}
        ];

        this.rectangles = rectangles.concat(level2);
    }
    */

    update() {

        this.show();
    }
    new_line_obstacle(_x1, _y1, _x2, _y2) {
        /* mouseUpDown can be up or down */

        this.lines.push({
            x1: _x1,
            y1: _y1,
            x2: _x2,
            y2: _y2, 
            w: this.linewidth
        });
    }
    show() {
        // show lines
        for (var i = this.lines.length - 1; i >= 0; i--) {
            let l = this.lines[i];
            stroke(0);
            strokeWeight(this.linewidth);
            line(l.x1, l.y1, l.x2, l.y2);
        }
    }

    clicked_line(x, y, diam) {
        for (var i = this.lines.length -1; i >= 0; i--) {
            let l = this.lines[i];
            let pdist = this.pDistance(x, y, l.x1, l.y1, l.x2, l.y2);
            if (pdist < diam/2) {
                return i;
                break;
            }

        }
        return null;
    }
    remove_obstacle(index) {

        this.lines.splice(index, 1);
    }

    coord_in_obstacle(x, y, diam) {
        for (var i = this.lines.length -1; i >= 0; i--) {
            let l = this.lines[i];
            let pdist = this.pDistance(x, y, l.x1, l.y1, l.x2, l.y2);
            if (pdist < diam/2) {
                return true;
                break;
            }

        }
        return false;
    }

    pDistance(x, y, x1, y1, x2, y2) {

      var A = x - x1;
      var B = y - y1;
      var C = x2 - x1;
      var D = y2 - y1;

      var dot = A * C + B * D;
      var len_sq = C * C + D * D;
      var param = -1;
      if (len_sq != 0) //in case of 0 length line
          param = dot / len_sq;

      var xx, yy;

      if (param < 0) {
        xx = x1;
        yy = y1;
      }
      else if (param > 1) {
        xx = x2;
        yy = y2;
      }
      else {
        xx = x1 + param * C;
        yy = y1 + param * D;
      }

      var dx = x - xx;
      var dy = y - yy;
      return Math.sqrt(dx * dx + dy * dy);
    }


    has_line_of_sight(x1, y1, x2, y2) {
        if (this.line_through_obstacle(x1, y1, x2, y2)) {
            return false;
        } else {
            return true;
        }
    }
    line_of_sight(dot, goal) {
        /* returns the coordinate of the first object that breaks line of sigth or nothing */
        return this.line_through_obstacle(dot.pos.x, dot.pos.y, goal.pos.x, goal.pos.y);
    }

    line_through_obstacle(x1, y1, x2, y2) {
        var hit  = false;
        var closest_hit_coord;

        for (var i = this.lines.length -1; i >= 0; i--) {
            let l = this.lines[i];
            let hitcoord = this.line_line_intersect(x1,y1,x2,y2, l.x1, l.y1, l.x2, l.y2);
            
            if (hitcoord) {
                let d = dist(x1, y1, hitcoord.x, hitcoord.y);
                if (!closest_hit_coord || d < closest_hit_coord.distance) { 
                    closest_hit_coord = {x: hitcoord.x, y: hitcoord.y, distance: d};
                } 
            }

        }
        return closest_hit_coord;
    }

    line_line_intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
        // calculate the direction of the lines
        let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));

        // stroke('rgb(0, 0, 255)');
        // strokeWeight(2);
        // line(x1, y1, x2, y2);
        // line(x3, y3, x4, y4);

        // if uA and uB are between 0-1, lines are colliding
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            // optionally, draw a circle where the lines meet
            let intersectionX = x1 + (uA * (x2-x1));
            let intersectionY = y1 + (uA * (y2-y1));
            return {x: intersectionX, y: intersectionY};
        }
        return null;
    }	
}
