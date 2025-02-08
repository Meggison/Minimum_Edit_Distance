async function calculateEditDistance() {
    const sentence1 = document.getElementById('sentence1').value;
    const sentence2 = document.getElementById('sentence2').value;

    if (!sentence1 || !sentence2) {
        alert('Please enter both sentences');
        return;
    }

    // Show loading spinner
    document.querySelector('.loading').style.display = 'flex';
    
    // Disable button during calculation
    const button = document.querySelector('button');
    button.disabled = true;
    button.style.opacity = '0.7';

    try {
        const response = await fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sentence1, sentence2 }),
        });

        const data = await response.json();
        
        // Show results with animation
        const results = document.getElementById('results');
        results.classList.add('visible');
        
        document.getElementById('distance-result').textContent = 
            `The minimum edit distance between the two sentences is: ${data.distance}`;

        // Create heatmap with enhanced styling
        const heatmapData = [{
            z: data.matrix,
            x: data.str2,
            y: data.str1,
            type: 'heatmap',
            colorscale: [
                [0, '#ffffff'],
                [0.3, '#e0e7ff'],
                [0.6, '#818cf8'],
                [1, '#4f46e5']
            ],
            showscale: true,
            hoverongaps: false,
            hoverinfo: 'text',
            text: data.matrix.map((row, i) => 
                row.map((val, j) => {
                    const isMatch = i > 0 && j > 0 && data.sentence1[i-1] === data.sentence2[j-1];
                    return `Value: ${val}${isMatch ? ' (Match)' : ''}`;
                })
            )
        }];

        const layout = {
            title: {
                text: 'Edit Distance Matrix Heatmap',
                font: {
                    family: 'Inter',
                    size: 24,
                    color: '#1e293b'
                }
            },
            annotations: [],
            xaxis: {
                title: 'Second Sentence Characters',
                titlefont: {
                    family: 'Inter',
                    size: 16,
                    color: '#64748b'
                },
                tickfont: {
                    family: 'Inter',
                    size: 14
                },
                side: 'bottom',
                gridcolor: '#e2e8f0',
                tickmode: 'array',
                ticktext: data.str2,
                tickvals: Array.from({length: data.str2.length}, (_, i) => i)
            },
            yaxis: {
                title: 'First Sentence Characters',
                titlefont: {
                    family: 'Inter',
                    size: 16,
                    color: '#64748b'
                },
                tickfont: {
                    family: 'Inter',
                    size: 14
                },
                gridcolor: '#e2e8f0',
                tickmode: 'array',
                ticktext: data.str1,
                tickvals: Array.from({length: data.str1.length}, (_, i) => i)
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            margin: {
                l: 80,
                r: 60,
                t: 80,
                b: 80
            },
            width: Math.min(800, window.innerWidth - 80),
            height: Math.min(800, window.innerWidth - 80),
            autosize: true
        };

        // Add value annotations
        for (let i = 0; i < data.matrix.length; i++) {
            for (let j = 0; j < data.matrix[i].length; j++) {
                const isMatch = i > 0 && j > 0 && data.sentence1[i-1] === data.sentence2[j-1];
                layout.annotations.push({
                    x: j,
                    y: i,
                    text: data.matrix[i][j].toString(),
                    showarrow: false,
                    font: {
                        family: 'Inter',
                        size: 14,
                        color: data.matrix[i][j] > (Math.max(...data.matrix.flat()) / 2) ? 'white' : '#1e293b',
                        weight: isMatch ? 'bold' : 'normal'
                    },
                    bgcolor: isMatch ? 'rgba(79, 70, 229, 0.1)' : null
                });
            }
        }

        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
            toImageButtonOptions: {
                format: 'png',
                filename: 'edit_distance_matrix',
                height: 800,
                width: 800,
                scale: 2
            }
        };

        await Plotly.newPlot('heatmap', heatmapData, layout, config);
        
        // Show heatmap with animation
        const heatmap = document.getElementById('heatmap');
        heatmap.classList.add('visible');

    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while calculating the edit distance');
    } finally {
        // Hide loading spinner and re-enable button
        document.querySelector('.loading').style.display = 'none';
        button.disabled = false;
        button.style.opacity = '1';
    }
}

// Add input animations
document.addEventListener('DOMContentLoaded', () => {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        textarea.addEventListener('focus', () => {
            textarea.parentElement.style.transform = 'translateY(-5px)';
        });
        
        textarea.addEventListener('blur', () => {
            textarea.parentElement.style.transform = 'translateY(0)';
        });
    });
});
