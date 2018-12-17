;

function Radians(angle_in_degrees) 
{
	return angle_in_degrees * (Math.PI / 180);
}

function PushVertex(a, v)
{
	switch (v.length)
	{
		case 2:
			a.push(v[0], v[1]);
			break;

		case 3:
			a.push(v[0], v[1], v[2]);
			break;

		case 4:
			a.push(v[0], v[1], v[2], v[3]);
			break;
	}
}

function ProjectText(P, mvp, ctx, text, alignment = "left")
{
	ctx.textAlign = alignment;
	var p = vec4.clone(P);
	vec4.transformMat4(p, p, mvp);
	p[0] /= p[3];
	p[1] /= p[3];
	var c = vec2.fromValues((p[0] * 0.5 + 0.5) * gl.canvas.width, (p[1] * -0.5 + 0.5) * gl.canvas.height);
	ctx.fillText(text, c[0], c[1]);
}

function DrawScene(now)
{
	if (last_time_updated == 0)
		last_time_updated = now;

	Engine.update(engine, now - last_time_updated);
	last_time_updated = now;
	var unselected_fill = vec4.fromValues(0.5, 0, 0, 1);
	var selected_fill = vec4.fromValues(0.7, 0, 0, 1);
	var bodies = Composite.allBodies(engine.world);
	var projection_matrix = mat4.create();
	var model_matrix = mat4.create();
	var view_matrix = mat4.create();
	var mvp = mat4.create();
	var p = vec4.create();
	var c = vec2.create();

	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.textAlign = "left";
	ctx.fillText("Drop It! v 0.2", 20, 50);

	gl.clearColor(0.1, 0.1, 0.1, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

	mat4.lookAt(view_matrix, vec3.fromValues(0.0, 0.0, 10.0), vec3.fromValues(0.0, 0.0, 0.0), y_axis);
	mat4.ortho(projection_matrix, 0, 2 * canvas.width, 2 * canvas.height, 0, near_plane, far_plane);

	for (var body_index = 0; body_index < bodies.length; body_index++)
	{
		model_matrix = mat4.create();
		mat4.scale(model_matrix, model_matrix, vec3.fromValues(1, -1, 1));
		var body = bodies[body_index];
		var pos = body.position;
		if (pos.y > 2 * textCanvas.height || pos.x < -10) 
		{
			this.ResetBall(body);
		}
		mat4.translate(model_matrix, model_matrix, vec3.fromValues(pos.x, -pos.y, 0));
		mat4.rotate(model_matrix, model_matrix, -body.angle, z_axis);
		var fill_color = body == (selected_body) ? selected_fill : unselected_fill;
		if (body.label == 'rect') {
			boxes[body.size_id].Draw(
				model_matrix, 
				view_matrix, 
				projection_matrix, 
				vec4.fromValues(1, 0, 0, 1),
				fill_color
			);
		}
		else if (body.label == 'ball')
		{
			solid_disc.Draw(model_matrix, view_matrix, projection_matrix, fill_color);
			disc_rim.Draw(model_matrix, view_matrix, projection_matrix, vec4.fromValues(1,0,0,1));
		}
	}
	
	var mvp = mat4.create();
	mat4.multiply(mvp, projection_matrix, view_matrix);
	ProjectText(vec4.fromValues(2 * textCanvas.width - 100, 100, 0, 1), mvp, ctx, "Ball: " + 
		ball.position.x.toFixed(2).toString().padStart(7) + " , " + 
		ball.position.y.toFixed(2).toString().padStart(7), "right");

	requestAnimationFrame(DrawScene);
}

