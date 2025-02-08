from flask import Flask, render_template, request, jsonify
import numpy as np

app = Flask(__name__)

def calculate_edit_distance(str1, str2):
    m, n = len(str1), len(str2)
    dp = np.zeros((m + 1, n + 1))
    
    # Initialize first row and column
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    
    # Fill the matrix
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if str1[i-1] == str2[j-1]:
                dp[i][j] = dp[i-1][j-1]
            else:
                dp[i][j] = min(
                    dp[i-1][j] + 1,    # deletion
                    dp[i][j-1] + 1,    # insertion
                    dp[i-1][j-1] + 1   # substitution
                )
    
    return dp.tolist()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    sentence1 = data['sentence1'].strip()
    sentence2 = data['sentence2'].strip()
    
    # Calculate edit distance matrix
    distance_matrix = calculate_edit_distance(sentence1, sentence2)
    
    # Create x-axis labels (second sentence)
    x_labels = [''] + list(sentence2)  # Empty string for the first column
    
    # Create y-axis labels (first sentence)
    y_labels = [''] + list(sentence1)  # Empty string for the first row
    
    # Get the final edit distance (bottom-right cell)
    edit_distance = distance_matrix[-1][-1]
    
    return jsonify({
        'matrix': distance_matrix,
        'distance': int(edit_distance),
        'str1': y_labels,
        'str2': x_labels,
        'sentence1': sentence1,
        'sentence2': sentence2
    })

if __name__ == '__main__':
    app.run(debug=True)
