;

class Disc
{
	constructor()
	{
		this.triangle_vrts = [];
		this.texture_coords = [];
		this.indicies = [];

		this.texture_coords_buffer = null;
		this.triangle_vrts_buffer = null;
		this.indicies_buffer = null;
	}

	InitializeShader()
	{
		this.p_shader = CreateShader("vertex_shader", "fragment_shader");
		gl.useProgram(this.p_shader);
		this.p_coordinates = gl.getAttribLocation(this.p_shader, "vertex_coordinates");
		this.p_modelview_matrix_handle = gl.getUniformLocation(this.p_shader, "modelview_matrix");
		this.p_projection_matrix_handle = gl.getUniformLocation(this.p_shader, "projection_matrix");
		this.p_color_handle = gl.getUniformLocation(this.p_shader, "color");
		gl.useProgram(null);
	}

	Initialize(fr, br, fc, bc, beginning_theta, ending_theta, slices, stacks)
	{
		this.slices = slices;
		this.stacks = stacks;
		this.CreateBuffers();
		this.MakeVerticiesAndTriangles(fr, br, fc, bc, beginning_theta, ending_theta, slices, stacks);
		this.BindBuffers();
		this.InitializeShader();
	}

	LERP(a, b, t)
	{
		return a + (b - a) * t;
	}

	MakeVerticiesAndTriangles(fr, br, fc, bc, beginning_theta, ending_theta, slices, stacks)
	{
		if (slices < 2)
			throw new Error('Disc slices must be more than 2');

		if (beginning_theta == undefined)
			beginning_theta = 0;

		if (ending_theta == undefined)
			ending_theta = 360;

		var z_axis = [0, 0, 1];
		var partial_sweep = (beginning_theta != ((ending_theta + 360) % 360));
		var real_slices = slices + (partial_sweep ? 1 : 0);
		this.sweep = ending_theta - beginning_theta;
		var incremental_theta = this.sweep / slices;
		var incremental_back_to_front = 1.0 / (stacks);
		var back_to_front = 0;
		var center = vec3.create();
		var p = vec3.create();

		beginning_theta = Radians(beginning_theta);
		ending_theta = Radians(ending_theta);
		incremental_theta = Radians(incremental_theta);

		for (var stk = 0; stk < stacks + 1; stk++)
		{
			var u = stk / stacks;
			var x = [this.LERP(br, fr, back_to_front), 0, 0];
			vec3.lerp(center, bc, fc, back_to_front);
			var r = mat4.create();

			mat4.rotate(r, r, beginning_theta, z_axis);
			for (var slc = 0; slc < real_slices; slc++)
			{
				var v = slc / slices;
				vec3.transformMat4(p, x, r);
				vec3.add(p, p, center);
				PushVertex(this.triangle_vrts, p);
				PushVertex(this.texture_coords, [u, v]);
				mat4.rotate(r, r, incremental_theta, z_axis);
			}
			back_to_front += incremental_back_to_front;
		}

		for (var stk = 0; stk < stacks; stk++)
		{
			for (var slc = 0; slc < slices; slc++)
			{
				this.indicies.push(stk * real_slices + slc);
				this.indicies.push(stk * real_slices + (slc + 1) % real_slices);
				this.indicies.push((stk + 1) * real_slices + slc);
				this.indicies.push(stk * real_slices + (slc + 1) % real_slices);
				this.indicies.push((stk + 1) * real_slices + (slc + 1) % real_slices);
				this.indicies.push((stk + 1) * real_slices + slc);
			}
		}
	}

	CreateBuffers()
	{
		this.triangle_vrts_buffer = gl.createBuffer();
		this.texture_coords_buffer = gl.createBuffer();
		this.indicies_buffer = gl.createBuffer();
	}

	BindBuffers()
	{
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triangle_vrts_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.triangle_vrts), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_coords_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texture_coords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicies_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(this.indicies), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	
	Draw(model_matrix, view_matrix, projection_matrix, fill_color)
	{
		var modelview_matrix = mat4.create();
		mat4.multiply(modelview_matrix, view_matrix, model_matrix);
		
		gl.useProgram(this.p_shader);
		gl.uniformMatrix4fv(this.p_projection_matrix_handle, false, projection_matrix);
		gl.uniformMatrix4fv(this.p_modelview_matrix_handle, false, modelview_matrix);		
		gl.uniform4fv(this.p_color_handle, fill_color);

		gl.enableVertexAttribArray(this.p_coordinates);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.triangle_vrts_buffer);
		gl.vertexAttribPointer(this.p_coordinates, 3, gl.FLOAT, false, 0, 0);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indicies_buffer);
		gl.drawElements(gl.TRIANGLES, this.indicies.length, gl.UNSIGNED_SHORT, 0);


		gl.disableVertexAttribArray(this.p_coordinates);
		gl.useProgram(null);
	}
}