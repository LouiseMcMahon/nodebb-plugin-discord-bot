<h1><i class="fa fa-picture-o"></i> Discord Bot Configuration</h1>
<hr />

<p>You can configure this plugin via a combination of the below, for instance, you can use <em>instance meta-data</em> and <em>environment variables</em> in combination. You can also specify values in the form below, and those will be stored in the database.</p>

<h3>Environment Variables</h3>
<pre>
    <code>
        export DISCORD_BOT_EMAIL="xxxxx"
        export DISCORD_BOT_PASSWORD="yyyyy"
        export DISCORD_BOT_CHANNEL="zzzzz"
    </code>
</pre>

<h3>Database Stored configuration:</h3>
<form id="discord-bot">
    <label for="botEmail">Bot Email</label><br />
    <input type="text" id="botEmail" name="botEmail" value="{botEmail}" title="Bot Email" class="form-control input-lg" placeholder="Bot Email Address"><br />

    <label for="botPassword">Bot Password</label><br />
    <input type="text" id="botPassword" name="botPassword" value="{botPassword}" title="Bot Password" class="form-control input-lg" placeholder="Bots Password"><br />

    <label for="botUpdateChannel">Bot Update Channel ID</label><br />
    <input type="text" id="botUpdateChannel" name="botUpdateChannel" value="{botUpdateChannel}" title="Bot Update Channel ID" class="form-control input-lg" placeholder="Bot Update Channel ID"><br />

    <button class="btn btn-primary" type="submit">Save</button>
</form>


<script>
  $(document).ready(function() {
    $("#discord-bot").on("submit", function (e) {
      e.preventDefault();
      save("nodebbBotSettings", this);
    });

    function save(type, form) {
      var data = {
        _csrf: '{csrf}' || $('#csrf_token').val()
      };

      var values = $(form).serializeArray();
      for (var i = 0, l = values.length; i < l; i++) {
        data[values[i].name] = values[i].value;
      }

      $.post('/api/admin/plugins/discord-bot/' + type, data).done(function (response) {
        if (response) {
          ajaxify.refresh();
          app.alertSuccess(response);
        }
      }).fail(function (jqXHR, textStatus, errorThrown) {
        ajaxify.refresh();
        app.alertError(jqXHR.responseJSON ? jqXHR.responseJSON.error : 'Error saving!');
      });
    }
  });
</script>
